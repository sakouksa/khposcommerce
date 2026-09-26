<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'message' => 'sometimes|required|string',
            'type' => 'sometimes|required|string|in:system,inventory,purchase,sales,customer,supplier,employee,attendance,payroll,finance,expense,payment,security,report,marketing,shipping,company,setting,warning,success,error',
            'priority' => 'sometimes|required|string|in:low,normal,high,critical',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'action_url' => 'nullable|string|max:500',
            'image' => 'nullable|string|max:500',
            'expires_at' => 'nullable|date',
            'is_global' => 'nullable|boolean',
        ];
    }
}
