<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'nullable|exists:companies,id',
            'branch_id' => 'nullable|exists:branches,id',
            'type' => 'required|string|in:system,inventory,purchase,sales,customer,supplier,employee,attendance,payroll,finance,expense,payment,security,report,marketing,shipping,company,setting,warning,success,error',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'priority' => 'required|string|in:low,normal,high,critical',
            'image' => 'nullable|string|max:500',
            'action_url' => 'nullable|string|max:500',
            'reference_type' => 'nullable|string|max:100',
            'reference_id' => 'nullable|string|max:100',
            'expires_at' => 'nullable|date',
            'is_global' => 'nullable|boolean',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id',
            'role' => 'nullable|string',
            'permission' => 'nullable|string',
            'template_code' => 'nullable|string|exists:notification_templates,code',
            'template_data' => 'nullable|array',
            'channels' => 'nullable|array',
            'channels.*' => 'in:database,email,telegram,sms,push,websocket',
        ];
    }
}
