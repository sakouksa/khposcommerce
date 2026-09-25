<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class RegisterCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:customers,email'],
            'phone'    => ['nullable', 'string', 'max:50', 'unique:customers,phone'],
            'password' => ['required', 'string', 'min:6'],
        ];
    }
}
