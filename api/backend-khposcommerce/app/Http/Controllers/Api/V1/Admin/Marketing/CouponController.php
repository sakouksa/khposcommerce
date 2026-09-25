<?php

namespace App\Http\Controllers\Api\V1\Admin\Marketing;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Marketing\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CouponController extends BaseApiController
{
    private function clearCouponCache(): void
    {
        Cache::forget('admin_coupons_list_15');
        Cache::forget('admin_coupons_list_20');
        Cache::forget('admin_coupons_list_50');
    }

    public function index(Request $request): JsonResponse
    {
        $hasSearch = $request->filled('search');
        $hasActive = $request->filled('is_active');
        $perPage   = (int) $request->get('per_page', 20);

        if (!$hasSearch && !$hasActive && $perPage <= 50) {
            $coupons = Cache::remember("admin_coupons_list_{$perPage}", 300, function () use ($perPage) {
                return Coupon::query()->latest()->paginate($perPage);
            });
            return $this->paginatedResponse($coupons);
        }

        $query = Coupon::query()
            ->when($hasSearch, fn($q) =>
                $q->where('code', 'like', "%{$request->search}%")
                  ->orWhere('name', 'like', "%{$request->search}%")
            )
            ->when($hasActive, fn($q) =>
                $q->where('is_active', (bool) $request->is_active)
            )
            ->latest();

        $coupons = $query->paginate($perPage);

        return $this->paginatedResponse($coupons);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'code'              => 'required|string|max:50|unique:coupons,code',
            'type'              => 'required|in:fixed,percentage,free_shipping',
            'value'             => 'required|numeric|min:0',
            'minimum_amount'    => 'nullable|numeric|min:0',
            'maximum_discount'  => 'nullable|numeric|min:0',
            'usage_limit'       => 'nullable|integer|min:1',
            'usage_per_user'    => 'nullable|integer|min:1',
            'starts_at'         => 'nullable|date',
            'expires_at'        => 'nullable|date|after_or_equal:starts_at',
            'is_active'         => 'boolean',
        ]);

        $coupon = Coupon::create($validated);
        $this->clearCouponCache();

        return $this->successResponse($coupon, 'Coupon created successfully.', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(Coupon::findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $validated = $request->validate([
            'name'              => 'sometimes|required|string|max:255',
            'code'              => "sometimes|required|string|max:50|unique:coupons,code,{$id}",
            'type'              => 'sometimes|required|in:fixed,percentage,free_shipping',
            'value'             => 'sometimes|required|numeric|min:0',
            'minimum_amount'    => 'nullable|numeric|min:0',
            'maximum_discount'  => 'nullable|numeric|min:0',
            'usage_limit'       => 'nullable|integer|min:1',
            'is_active'         => 'boolean',
            'expires_at'        => 'nullable|date',
        ]);

        $coupon->update($validated);
        $this->clearCouponCache();

        return $this->successResponse($coupon, 'Coupon updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();
        $this->clearCouponCache();

        return $this->successResponse(null, 'Coupon deleted successfully.');
    }

    /** Generate a random unique coupon code */
    public function generateCode(): JsonResponse
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (Coupon::where('code', $code)->exists());

        return $this->successResponse(['code' => $code]);
    }

    /** Validate and calculate coupon discount for POS / Cart */
    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'   => 'required|string',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $code = strtoupper(trim($request->code));
        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return $this->errorResponse('Invalid coupon code.', 404);
        }

        if (!$coupon->is_active) {
            return $this->errorResponse('This coupon code is inactive.', 422);
        }

        if ($coupon->starts_at && now()->lt($coupon->starts_at)) {
            return $this->errorResponse('This coupon has not started yet.', 422);
        }

        if ($coupon->expires_at && now()->gt($coupon->expires_at)) {
            return $this->errorResponse('This coupon code has expired.', 422);
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return $this->errorResponse('This coupon usage limit has been reached.', 422);
        }

        $amount = (float) ($request->amount ?? 0);
        if ($coupon->minimum_amount && $amount < $coupon->minimum_amount) {
            return $this->errorResponse("Minimum order amount of \${$coupon->minimum_amount} required.", 422);
        }

        $discount = 0;
        if ($coupon->type === 'fixed') {
            $discount = (float) $coupon->value;
        } elseif ($coupon->type === 'percentage') {
            $discount = $amount * ((float) $coupon->value / 100);
            if ($coupon->maximum_discount && $discount > $coupon->maximum_discount) {
                $discount = (float) $coupon->maximum_discount;
            }
        }

        return $this->successResponse([
            'coupon_id' => $coupon->id,
            'code'      => $coupon->code,
            'name'      => $coupon->name,
            'type'      => $coupon->type,
            'value'     => (float) $coupon->value,
            'discount'  => round($discount, 2),
        ], 'Coupon applied successfully.');
    }
}
