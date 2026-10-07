<?php

namespace App\Models\Marketing;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Company\Company;
use App\Models\Company\Store;
use App\Traits\CleansStorageFiles;
use App\Traits\HasMediaUrl;

class Banner extends Model
{
    use HasFactory, SoftDeletes, CleansStorageFiles, HasMediaUrl;

    protected $fillable = [
        'company_id', 'store_id', 'title', 'subtitle', 'badge',
        'discount_tag', 'button_text', 'theme_gradient', 'image',
        'mobile_image', 'link', 'position', 'sort_order', 'starts_at',
        'ends_at', 'is_active',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $appends = ['image_url', 'link_url'];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->formatStorageUrl($this->attributes['image'] ?? null, 'api/v1/storage/banners/banner_hero_1.webp');
    }

    public function getLinkUrlAttribute(): ?string
    {
        return $this->attributes['link'] ?? null;
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
