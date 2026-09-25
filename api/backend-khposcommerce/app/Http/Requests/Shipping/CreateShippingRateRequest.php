<?php

namespace App\Http\Requests\Shipping;

use Illuminate\Foundation\Http\FormRequest;

class CreateShippingRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_method_id' => ['integer', 'exists:shipping_methods,id'],
            'shipping_zone_id' => ['integer', 'exists:shipping_zones,id'],
            'min_weight' => ['numeric'],
            'max_weight' => ['numeric'],
            'price' => ['numeric'],
            'estimated_days_min' => ['integer'],
            'estimated_days_max' => ['integer'],
            'is_active' => ['boolean']
        ];
    }
}
