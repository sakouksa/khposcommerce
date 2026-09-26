<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\CleansStorageFiles;
use App\Traits\HasMediaUrl;

class ProductImage extends Model
{
    use HasFactory, CleansStorageFiles, HasMediaUrl;
    protected $fillable = ['product_id', 'image', 'alt_text', 'sort_order', 'is_primary'];
    protected $casts    = ['is_primary' => 'boolean'];
    protected $appends  = ['url'];

    public function getUrlAttribute(): ?string
    {
        return $this->formatStorageUrl($this->attributes['image'] ?? null);
    }

    public function product() { return $this->belongsTo(Product::class); }
}

