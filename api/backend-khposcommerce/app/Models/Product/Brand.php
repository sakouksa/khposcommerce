<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\SoftDeletesEnterprise;
use App\Traits\CleansStorageFiles;
use App\Traits\HasMediaUrl;

class Brand extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise, CleansStorageFiles, HasMediaUrl;
    protected $fillable = ['company_id', 'name', 'slug', 'description', 'logo', 'is_active'];
    protected $casts    = ['is_active' => 'boolean'];
    protected $appends  = ['logo_url'];

    /** Return a full, publicly accessible URL for the brand logo. */
    public function getLogoUrlAttribute(): ?string
    {
        return $this->formatStorageUrl($this->attributes['logo'] ?? null);
    }

    public function products(): HasMany { return $this->hasMany(Product::class); }
    public function scopeActive($query) { return $query->where('is_active', true); }
}
