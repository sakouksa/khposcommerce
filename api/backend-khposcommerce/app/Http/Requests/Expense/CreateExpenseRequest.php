<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class CreateExpenseRequest extends FormRequest
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
        if (!$this->filled('date') && !$this->filled('expense_date')) {
            $this->merge(['date' => now()->toDateString()]);
        }
        if (!$this->filled('company_id')) {
            $this->merge(['company_id' => $this->user()?->company_id ?? 1]);
        }
    }

    public function rules(): array
    {
        return [
            'company_id' => ['sometimes', 'integer', 'exists:companies,id'],
            'branch_id' => ['sometimes', 'integer', 'exists:branches,id'],
            'expense_category_id' => ['required', 'integer', 'exists:expense_categories,id'],
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'reference_number' => ['nullable', 'string'],
            'title' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric'],
            'date' => ['required', 'string'],
            'expense_date' => ['nullable', 'string'],
            'receipt' => ['nullable', 'string'],
            'status' => ['nullable', 'string']
        ];
    }
}
