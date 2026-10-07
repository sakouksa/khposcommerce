<?php

namespace App\Models\CMS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\User;

use App\Traits\SoftDeletesEnterprise;
use App\Traits\CleansStorageFiles;

class Blog extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise, CleansStorageFiles;

    protected $fillable = [
        'company_id', 'blog_category_id', 'user_id', 'title', 'slug',
        'excerpt', 'summary', 'content', 'featured_image', 'status',
        'published_at', 'view_count', 'meta_title', 'meta_description',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function category(): BelongsTo { return $this->belongsTo(BlogCategory::class, 'blog_category_id'); }
    public function author(): BelongsTo   { return $this->belongsTo(User::class, 'user_id'); }
    public function tags(): BelongsToMany { return $this->belongsToMany(BlogTag::class, 'blog_blog_tag', 'blog_id', 'blog_tag_id'); }
}
