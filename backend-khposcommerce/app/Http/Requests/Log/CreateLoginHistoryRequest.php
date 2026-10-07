<?php

namespace App\Http\Requests\Log;

use Illuminate\Foundation\Http\FormRequest;

class CreateLoginHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['integer', 'exists:users,id'],
            'ip_address' => ['string'],
            'user_agent' => ['string'],
            'device' => ['string'],
            'browser' => ['string'],
            'platform' => ['string'],
            'success' => ['boolean']
        ];
    }
}
