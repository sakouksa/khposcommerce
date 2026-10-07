<?php

namespace App\Services\Product;

use App\Repositories\Product\ProductVariantRepository;
use App\Models\Product\Product;
use App\Models\Product\ProductVariant;
use App\Models\Product\AttributeValue;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ProductVariantService
{
    public function __construct(private readonly ProductVariantRepository $repository)
    {
    }

    public function getAll(array $relations = []): Collection
    {
        return $this->repository->all(relations: $relations);
    }

    public function getPaginated(int $perPage = 15, array $relations = []): LengthAwarePaginator
    {
        return $this->repository->paginate($perPage, relations: $relations ?: ['attributeValues.attribute']);
    }

    public function getById(int|string $id, array $relations = []): ProductVariant
    {
        return $this->repository->findById($id, relations: $relations ?: ['attributeValues.attribute']);
    }

    public function create(array $data): ProductVariant
    {
        $attributeValues = $data['attribute_values'] ?? [];
        unset($data['attribute_values']);

        if (empty($data['sku'])) {
            $product = Product::find($data['product_id']);
            $prefix = $product ? Str::slug($product->name) : 'SKU';
            $data['sku'] = strtoupper($prefix . '-' . Str::random(6));
        }

        if (\DB::getDriverName() === 'pgsql') {
            \DB::statement("SELECT setval('product_variants_id_seq', COALESCE((SELECT MAX(id) FROM product_variants), 0) + 1, false);");
        }

        $variant = $this->repository->create($data);

        if (!empty($attributeValues)) {
            foreach ($attributeValues as $attrValId) {
                $attrVal = AttributeValue::find($attrValId);
                if ($attrVal) {
                    $variant->variantValues()->create([
                        'attribute_value_id' => $attrValId,
                        'attribute_id'       => $attrVal->attribute_id,
                    ]);
                }
            }
        }

        // Create initial Inventory stock record (defaults to 5 if not provided)
        $stockInput = array_key_exists('stock', $data) ? $data['stock'] : (array_key_exists('quantity', $data) ? $data['quantity'] : 5);
        $stockQty = (float) ($stockInput ?? 5);

        \App\Models\Inventory\Inventory::create([
            'company_id'         => 1,
            'warehouse_id'       => 1,
            'product_id'         => $variant->product_id,
            'product_variant_id' => $variant->id,
            'quantity'           => $stockQty,
            'reserved_quantity'  => 0,
        ]);

        // Enable variants flag on product if not set
        Product::where('id', $data['product_id'])->where('has_variants', false)->update(['has_variants' => true]);

        return $variant->load(['attributeValues.attribute']);
    }

    public function update(int|string $id, array $data): ProductVariant
    {
        $attributeValues = $data['attribute_values'] ?? null;
        $stockInput = array_key_exists('stock', $data) ? $data['stock'] : null;
        unset($data['attribute_values']);

        $variant = $this->repository->update($id, $data);

        if ($stockInput !== null) {
            $stockQty = (float) $stockInput;
            $inventory = \App\Models\Inventory\Inventory::where('product_id', $variant->product_id)
                ->where('product_variant_id', $variant->id)
                ->first();

            if ($inventory) {
                $inventory->update(['quantity' => $stockQty]);
            } else {
                \App\Models\Inventory\Inventory::create([
                    'company_id'         => 1,
                    'warehouse_id'       => 1,
                    'product_id'         => $variant->product_id,
                    'product_variant_id' => $variant->id,
                    'quantity'           => $stockQty,
                    'reserved_quantity'  => 0,
                ]);
            }
        }

        if ($attributeValues !== null) {
            $variant->variantValues()->delete();
            foreach ($attributeValues as $attrValId) {
                $attrVal = AttributeValue::find($attrValId);
                if ($attrVal) {
                    $variant->variantValues()->create([
                        'attribute_value_id' => $attrValId,
                        'attribute_id'       => $attrVal->attribute_id,
                    ]);
                }
            }
        }

        return $variant->load(['attributeValues.attribute', 'inventories']);
    }

    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    public function bulkDelete(array $ids): int
    {
        $count = 0;
        foreach ($ids as $id) {
            try {
                if ($this->repository->delete($id)) {
                    $count++;
                }
            } catch (\Exception $e) {
                // Ignore single item error
            }
        }
        return $count;
    }
}
