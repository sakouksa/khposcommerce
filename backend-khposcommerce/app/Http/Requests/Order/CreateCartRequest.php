<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class CreateCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'store_id' => ['integer', 'exists:stores,id'],
            'customer_id' => ['integer', 'exists:customers,id'],
            'session_id' => ['string', 'exists:sessions,id'],
            'currency_code' => ['string']
        ];
    }
}
