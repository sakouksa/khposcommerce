<?php

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['integer', 'exists:products,id'],
            'customer_id' => ['integer', 'exists:customers,id'],
            'order_item_id' => ['integer', 'exists:order_items,id'],
            'name' => ['string'],
            'email' => ['string'],
            'rating' => ['boolean'],
            'title' => ['string'],
            'body' => ['string'],
            'status' => ['string'],
            'is_verified_purchase' => ['boolean']
        ];
    }
}
