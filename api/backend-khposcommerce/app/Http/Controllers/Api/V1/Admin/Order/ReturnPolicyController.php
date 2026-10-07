<?php

namespace App\Http\Controllers\Api\V1\Admin\Order;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Order\ReturnPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnPolicyController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->company_id ?? $request->user()?->company_id;

        $policies = ReturnPolicy::with('category')
            ->when($companyId, fn($q) => $q->where('company_id', $companyId))
            ->when($request->search, fn($q) => $q->where(function ($sq) use ($request) {
                $sq->where('name', 'like', "%{$request->search}%")
                   ->orWhereHas('category', fn($cq) => $cq->where('name', 'like', "%{$request->search}%"));
            }))
            ->orderBy('is_default', 'desc')
            ->orderBy('id', 'asc')
            ->paginate($request->get('per_page', 50));

        return $this->successResponse($policies, 'Return policies retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id'                  => 'required|exists:companies,id',
            'category_id'                 => 'nullable|exists:categories,id',
            'name'                        => 'required|string|max:255',
            'return_window_days'          => 'required|integer|min:0',
            'is_returnable'               => 'boolean',
            'allow_exchange'              => 'boolean',
            'restocking_fee_percentage'   => 'numeric|min:0|max:100',
            'restocking_fee_flat'         => 'numeric|min:0',
            'customer_fault_shipping_fee' => 'numeric|min:0',
            'store_fault_shipping_fee'    => 'numeric|min:0',
            'requires_original_packaging' => 'boolean',
            'requires_receipt'            => 'boolean',
            'conditions_accepted'         => 'nullable|array',
            'is_default'                  => 'boolean',
        ]);

        if (!empty($data['is_default']) && $data['is_default']) {
            ReturnPolicy::where('company_id', $data['company_id'])->update(['is_default' => false]);
        }

        $policy = ReturnPolicy::create($data);
        return $this->successResponse($policy, 'Return policy created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $policy = ReturnPolicy::with('category')->findOrFail($id);
        return $this->successResponse($policy, 'Return policy retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $policy = ReturnPolicy::findOrFail($id);

        $data = $request->validate([
            'category_id'                 => 'nullable|exists:categories,id',
            'name'                        => 'sometimes|string|max:255',
            'return_window_days'          => 'sometimes|integer|min:0',
            'is_returnable'               => 'boolean',
            'allow_exchange'              => 'boolean',
            'restocking_fee_percentage'   => 'numeric|min:0|max:100',
            'restocking_fee_flat'         => 'numeric|min:0',
            'customer_fault_shipping_fee' => 'numeric|min:0',
            'store_fault_shipping_fee'    => 'numeric|min:0',
            'requires_original_packaging' => 'boolean',
            'requires_receipt'            => 'boolean',
            'conditions_accepted'         => 'nullable|array',
            'is_default'                  => 'boolean',
        ]);

        if (!empty($data['is_default']) && $data['is_default']) {
            ReturnPolicy::where('company_id', $policy->company_id)->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $policy->update($data);
        return $this->successResponse($policy, 'Return policy updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $policy = ReturnPolicy::findOrFail($id);
        $policy->delete();
        return $this->successResponse(null, 'Return policy deleted successfully');
    }

    public function seedDefaults(Request $request): JsonResponse
    {
        $companyId = $request->company_id ?? $request->user()?->company_id ?? 1;

        $seeder = new \Database\Seeders\ReturnPolicySeeder();
        $seeder->run();

        $policies = ReturnPolicy::with('category')
            ->where('company_id', $companyId)
            ->orderBy('is_default', 'desc')
            ->orderBy('id', 'asc')
            ->get();

        return $this->successResponse($policies, 'Standard store return policies seeded successfully');
    }
}
