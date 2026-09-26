<?php

namespace App\Http\Requests\Log;

use Illuminate\Foundation\Http\FormRequest;

class CreateActivityLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'log_name' => ['string'],
            'description' => ['string'],
            'subject_type' => ['string'],
            'event' => ['string'],
            'subject_id' => ['integer', 'exists:subjects,id'],
            'causer_type' => ['string'],
            'causer_id' => ['integer', 'exists:causers,id'],
            'properties' => ['string'],
            'batch_uuid' => ['string']
        ];
    }
}
