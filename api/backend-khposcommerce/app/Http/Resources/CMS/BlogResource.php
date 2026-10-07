<?php

namespace App\Http\Resources\CMS;

use App\Http\Resources\Traits\FormatsMediaUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    use FormatsMediaUrl;

    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'company_id'       => $this->company_id,
            'blog_category_id' => $this->blog_category_id,
            'user_id'          => $this->user_id,
            'title'            => $this->title,
            'slug'             => $this->slug,
            'excerpt'          => $this->excerpt ?? $this->summary,
            'summary'          => $this->excerpt ?? $this->summary,
            'content'          => $this->content,
            'featured_image'   => $this->formatMediaUrl($this->featured_image),
            'status'           => $this->status,
            'published_at'     => $this->published_at?->toIso8601String(),
            'view_count'       => (int) ($this->view_count ?? 0),
            'meta_title'       => $this->meta_title,
            'meta_description' => $this->meta_description,
            'category'         => $this->whenLoaded('category'),
            'author'           => $this->whenLoaded('author'),
            'tags'             => $this->whenLoaded('tags'),
            'created_at'       => $this->created_at?->toIso8601String(),
            'updated_at'       => $this->updated_at?->toIso8601String(),
        ];
    }
}
