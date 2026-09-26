<?php

namespace App\Http\Requests\CMS;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => ['integer', 'exists:companies,id'],
            'blog_category_id' => ['integer', 'exists:blog_categories,id'],
            'user_id' => ['integer', 'exists:users,id'],
            'title' => ['string'],
            'slug' => ['string'],
            'excerpt' => ['string'],
            'content' => ['string'],
            'featured_image' => ['string'],
            'status' => ['string'],
            'published_at' => ['string'],
            'view_count' => ['integer'],
            'meta_title' => ['string'],
            'meta_description' => ['string']
        ];
    }
}
