<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['sometimes', 'required', 'integer', 'exists:customers,id'],
            'label'       => ['sometimes', 'required', 'string', 'max:100'],
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'phone'       => ['sometimes', 'required', 'string', 'max:50'],
            'address'     => ['sometimes', 'required', 'string'],
            'city'        => ['sometimes', 'required', 'string', 'max:255'],
            'province'    => ['sometimes', 'required', 'string', 'max:255'],
            'country'     => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'latitude'    => ['nullable', 'numeric'],
            'longitude'   => ['nullable', 'numeric'],
            'is_default'  => ['sometimes', 'boolean']
        ];
    }
}
