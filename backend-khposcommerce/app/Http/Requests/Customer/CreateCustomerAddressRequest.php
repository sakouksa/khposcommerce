<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CreateCustomerAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'label'       => ['required', 'string', 'max:100'],
            'name'        => ['required', 'string', 'max:255'],
            'phone'       => ['required', 'string', 'max:50'],
            'address'     => ['required', 'string'],
            'city'        => ['required', 'string', 'max:255'],
            'province'    => ['required', 'string', 'max:255'],
            'country'     => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'latitude'    => ['nullable', 'numeric'],
            'longitude'   => ['nullable', 'numeric'],
            'is_default'  => ['sometimes', 'boolean']
        ];
    }
}
