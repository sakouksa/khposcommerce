<?php

namespace App\Http\Controllers\Api\V1\Admin\Marketing;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Marketing\FlashSale;
use App\Models\Marketing\FlashSaleProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlashSaleController extends BaseApiController
{
    /** Admin: list all flash sales */
    public function index(Request $request): JsonResponse
    {
        $query = FlashSale::with(['products.product'])
            ->withCount('products')
            ->when($request->filled('search'), fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
            )
            ->latest();

        $flashSales = $query->paginate($request->get('per_page', 15));

        return $this->paginatedResponse($flashSales);
    }

    /** Public: active flash sale */
    public function active(): JsonResponse
    {
        $flashSale = FlashSale::where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->with('products.product')
            ->first();

        return $this->successResponse($flashSale);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'starts_at'  => 'required|date',
            'ends_at'    => 'required|date|after:starts_at',
            'is_active'  => 'boolean',
            'products'   => 'nullable|array',
            'products.*.product_id'       => 'required|exists:products,id',
            'products.*.discount_percent' => 'nullable|numeric|min:0|max:100',
            'products.*.flash_price'      => 'required|numeric|min:0',
            'products.*.quota'            => 'nullable|integer|min:1',
            'products.*.sold_count'       => 'nullable|integer|min:0',
            'products.*.product_variant_id' => 'nullable|integer',
        ]);

        $data = \Illuminate\Support\Arr::except($validated, ['products']);
        if (!isset($data['company_id'])) {
            $data['company_id'] = auth()->user()?->company_id ?? 1;
        }

        $flashSale = FlashSale::create($data);

        if (!empty($validated['products'])) {
            foreach ($validated['products'] as $prod) {
                FlashSaleProduct::create([
                    'flash_sale_id'       => $flashSale->id,
                    'product_id'          => $prod['product_id'],
                    'product_variant_id'  => $prod['product_variant_id'] ?? null,
                    'flash_price'         => $prod['flash_price'],
                    'discount_percent'    => $prod['discount_percent'] ?? 0,
                    'quota'               => $prod['quota'] ?? 50,
                    'sold_count'          => $prod['sold_count'] ?? 0,
                ]);
            }
        }

        return $this->successResponse($flashSale->load('products.product'), 'Flash sale created.', 201);
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(FlashSale::with('products.product')->findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $flashSale = FlashSale::findOrFail($id);

        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'starts_at'  => 'sometimes|required|date',
            'ends_at'    => 'sometimes|required|date|after:starts_at',
            'is_active'  => 'boolean',
            'products'   => 'nullable|array',
            'products.*.product_id'       => 'required|exists:products,id',
            'products.*.discount_percent' => 'nullable|numeric|min:0|max:100',
            'products.*.flash_price'      => 'required|numeric|min:0',
            'products.*.quota'            => 'nullable|integer|min:1',
            'products.*.sold_count'       => 'nullable|integer|min:0',
            'products.*.product_variant_id' => 'nullable|integer',
        ]);

        $flashSale->update(\Illuminate\Support\Arr::except($validated, ['products']));

        if (isset($validated['products'])) {
            $flashSale->products()->delete();
            foreach ($validated['products'] as $prod) {
                FlashSaleProduct::create([
                    'flash_sale_id'       => $flashSale->id,
                    'product_id'          => $prod['product_id'],
                    'product_variant_id'  => $prod['product_variant_id'] ?? null,
                    'flash_price'         => $prod['flash_price'],
                    'discount_percent'    => $prod['discount_percent'] ?? 0,
                    'quota'               => $prod['quota'] ?? 50,
                    'sold_count'          => $prod['sold_count'] ?? 0,
                ]);
            }
        }

        return $this->successResponse($flashSale->load('products.product'), 'Flash sale updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        FlashSale::findOrFail($id)->delete();

        return $this->successResponse(null, 'Flash sale deleted.');
    }
}
