<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('expense_date') && !$this->filled('date')) {
            $this->merge(['date' => $this->input('expense_date')]);
        }
    }

    public function rules(): array
    {
        return [
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'branch_id' => ['sometimes', 'integer', 'exists:branches,id'],
            'expense_category_id' => ['sometimes', 'integer', 'exists:expense_categories,id'],
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'reference_number' => ['nullable', 'string'],
            'title' => ['sometimes', 'string'],
            'description' => ['nullable', 'string'],
            'amount' => ['sometimes', 'numeric'],
            'date' => ['sometimes', 'string'],
            'expense_date' => ['nullable', 'string'],
            'receipt' => ['nullable', 'string'],
            'status' => ['nullable', 'string']
        ];
    }
}
