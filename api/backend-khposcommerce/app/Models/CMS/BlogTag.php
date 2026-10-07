<?php

namespace App\Models\CMS;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use Illuminate\Database\Eloquent\SoftDeletes;

class BlogTag extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['company_id', 'name', 'slug'];

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Blog::class, 'blog_blog_tag', 'blog_tag_id', 'blog_id');
    }
}
