<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notifiable_type' => ['string'],
            'notifiable_id' => ['integer', 'exists:notifiables,id'],
            'channel' => ['string'],
            'subject' => ['string'],
            'body' => ['string'],
            'status' => ['string'],
            'meta' => ['string'],
            'sent_at' => ['string']
        ];
    }
}
