<?php

namespace App\Http\Requests\Log;

use Illuminate\Foundation\Http\FormRequest;

class CreateAuditLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['integer', 'exists:users,id'],
            'event' => ['string'],
            'auditable_type' => ['string'],
            'auditable_id' => ['integer', 'exists:auditables,id'],
            'old_values' => ['string'],
            'new_values' => ['string'],
            'url' => ['string'],
            'ip_address' => ['string'],
            'user_agent' => ['string']
        ];
    }
}
