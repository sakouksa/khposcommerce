<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class ValidateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code'   => ['required', 'string', 'max:50'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
