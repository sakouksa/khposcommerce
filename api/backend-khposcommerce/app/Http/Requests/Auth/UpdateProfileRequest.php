<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'name'          => 'required|string|max:100',
            'email'         => "required|email|max:150|unique:users,email,{$userId}",
            'phone'         => 'nullable|string|max:30',
            'gender'        => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today',
            'address'       => 'nullable|string|max:1000',
            'country'       => 'nullable|string|max:100',
            'province'      => 'nullable|string|max:100',
            'city'          => 'nullable|string|max:100',
            'timezone'      => 'nullable|string|max:100',
            'language'      => 'nullable|string|max:10',
            'email_notify'   => 'nullable|boolean',
            'push_notify'    => 'nullable|boolean',
            'sms_notify'     => 'nullable|boolean',
        ];
    }
}
