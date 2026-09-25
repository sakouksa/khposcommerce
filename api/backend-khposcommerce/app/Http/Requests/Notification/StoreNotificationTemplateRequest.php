<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|max:100|unique:notification_templates,code',
            'name' => 'required|string|max:255',
            'title_template' => 'required|string|max:255',
            'message_template' => 'required|string',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'type' => 'required|string|in:system,inventory,purchase,sales,customer,supplier,employee,attendance,payroll,finance,expense,payment,security,report,marketing,shipping,company,setting,warning,success,error',
            'priority' => 'required|string|in:low,normal,high,critical',
            'is_active' => 'nullable|boolean',
        ];
    }
}
