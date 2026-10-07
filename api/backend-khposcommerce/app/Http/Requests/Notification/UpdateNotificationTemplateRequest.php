<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNotificationTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('notification_template') ?? $this->route('id');

        return [
            'code' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('notification_templates', 'code')->ignore($id)],
            'name' => 'sometimes|required|string|max:255',
            'title_template' => 'sometimes|required|string|max:255',
            'message_template' => 'sometimes|required|string',
            'icon' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'type' => 'sometimes|required|string|in:system,inventory,purchase,sales,customer,supplier,employee,attendance,payroll,finance,expense,payment,security,report,marketing,shipping,company,setting,warning,success,error',
            'priority' => 'sometimes|required|string|in:low,normal,high,critical',
            'is_active' => 'nullable|boolean',
        ];
    }
}
