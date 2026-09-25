<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id'          => 'required|integer|exists:companies,id',
            'name'                => 'required|string|max:100',
            'type'                => 'sometimes|required|string|in:select,color,button,text',
            'is_active'           => 'sometimes|boolean',
            'values'              => 'nullable|array',
            'values.*.value'      => 'required|string|max:100',
            'values.*.color_code' => 'nullable|string|max:50',
            'values.*.sort_order' => 'nullable|integer',
        ];
    }
}
