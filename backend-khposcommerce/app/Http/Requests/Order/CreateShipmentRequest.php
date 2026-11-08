<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CreateShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['integer', 'exists:orders,id'],
            'shipping_method_id' => ['integer', 'exists:shipping_methods,id'],
            'tracking_number' => ['string'],
            'carrier' => ['string'],
            'status' => ['string'],
            'shipped_at' => ['string'],
            'delivered_at' => ['string']
        ];
    }
}
