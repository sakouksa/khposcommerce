<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                => 'required|string|max:255',
            'sku'                 => 'required|string|max:100|unique:products,sku',
            'barcode'             => 'nullable|string|max:100|unique:products,barcode',
            'category_id'         => 'nullable|integer|exists:categories,id',
            'brand_id'            => 'nullable|integer|exists:brands,id',
            'unit_id'             => 'nullable|integer|exists:units,id',
            'tax_id'              => 'nullable|integer|exists:taxes,id',
            'cost_price'          => 'nullable|numeric|min:0',
            'selling_price'       => 'required|numeric|min:0',
            'compare_price'       => 'nullable|numeric|min:0',
            'description'         => 'nullable|string',
            'short_description'   => 'nullable|string',
            'weight'              => 'nullable|numeric|min:0',
            'length'              => 'nullable|numeric|min:0',
            'width'               => 'nullable|numeric|min:0',
            'height'              => 'nullable|numeric|min:0',
            'track_inventory'     => 'boolean',
            'has_variants'        => 'nullable|boolean',
            'low_stock_threshold' => 'integer|min:0',
            'status'              => 'required|string|in:active,inactive,draft,archived',
            'is_featured'         => 'boolean',
            'is_digital'          => 'boolean',
            'stock'               => 'nullable|numeric|min:0',
            'quantity'            => 'nullable|numeric|min:0',
            'meta_title'          => 'nullable|string|max:255',
            'meta_description'    => 'nullable|string',
            'meta_keywords'       => 'nullable|string',
            'variants'            => 'nullable|array',
            'variants.*.name'     => 'nullable|string|max:255',
            'variants.*.sku'      => 'nullable|string|max:100',
            'variants.*.barcode'  => 'nullable|string|max:100',
            'variants.*.cost_price' => 'nullable|numeric|min:0',
            'variants.*.selling_price' => 'nullable|numeric|min:0',
            'variants.*.stock'    => 'nullable|numeric|min:0',
            'variants.*.image'    => 'nullable|string',
            'variants.*.attribute_values' => 'nullable|array',
        ];
    }
}
