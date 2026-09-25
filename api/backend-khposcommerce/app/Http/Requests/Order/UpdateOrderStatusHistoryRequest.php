<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => ['integer', 'exists:orders,id'],
            'user_id' => ['integer', 'exists:users,id'],
            'status' => ['string'],
            'comment' => ['string'],
            'notify_customer' => ['boolean']
        ];
    }
}
