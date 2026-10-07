<?php

namespace App\Models\Product;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Company\Company;
use App\Models\Inventory\Inventory;

use App\Format\Traits\NormalizesAttributes;
use App\Traits\SoftDeletesEnterprise;

class Product extends Model
{
    use HasFactory, SoftDeletes, SoftDeletesEnterprise, NormalizesAttributes;

    protected $fillable = [
        'company_id', 'category_id', 'brand_id', 'unit_id', 'tax_id',
        'name', 'slug', 'sku', 'barcode', 'description', 'short_description',
        'cost_price', 'selling_price', 'compare_price',
        'weight', 'length', 'width', 'height',
        'has_variants', 'track_inventory', 'low_stock_threshold',
        'status', 'is_featured', 'is_digital',
        'meta_title', 'meta_description', 'meta_keywords',
    ];

    protected $casts = [
        'cost_price'          => 'decimal:2',
        'selling_price'       => 'decimal:2',
        'compare_price'       => 'decimal:2',
        'weight'              => 'decimal:3',
        'length'              => 'decimal:2',
        'width'               => 'decimal:2',
        'height'              => 'decimal:2',
        'has_variants'        => 'boolean',
        'track_inventory'     => 'boolean',
        'is_featured'         => 'boolean',
        'is_digital'          => 'boolean',
        'rating_avg'          => 'decimal:2',
    ];

    protected $appends = ['discount_percent', 'stock', 'image'];

    public function getImageAttribute(): ?string
    {
        if ($this->relationLoaded('primaryImage') && $this->primaryImage) {
            return $this->primaryImage->url ?? $this->primaryImage->image;
        }
        if ($this->relationLoaded('images') && $this->images->isNotEmpty()) {
            return $this->images->first()->url ?? $this->images->first()->image;
        }
        return $this->attributes['image'] ?? null;
    }

    public function getStockAttribute(): float
    {
        if (array_key_exists('stock', $this->attributes) && $this->attributes['stock'] !== null) {
            return (float) $this->attributes['stock'];
        }
        if (array_key_exists('stock_quantity', $this->attributes) && $this->attributes['stock_quantity'] !== null) {
            return (float) $this->attributes['stock_quantity'];
        }
        if ($this->has_variants) {
            if ($this->relationLoaded('variants') && $this->variants->count() > 0) {
                return (float) $this->variants->sum(function ($v) {
                    return $v->relationLoaded('inventories') ? (float) $v->inventories->sum('quantity') : (float) ($v->stock ?? 0);
                });
            }
            if ($this->exists) {
                return (float) Inventory::whereIn('product_variant_id', $this->variants()->pluck('id'))->sum('quantity');
            }
        }
        if ($this->relationLoaded('inventories')) {
            return (float) $this->inventories->sum('quantity');
        }
        if ($this->exists) {
            return (float) $this->inventories()->sum('quantity');
        }
        return 0.0;
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(ProductPrice::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(\App\Models\Review\ProductReview::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->hasMany(\App\Models\Review\ProductReview::class)->where('status', 'approved');
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeSearch($query, string $search)
    {
        $search = trim($search);
        if ($search === '') {
            return $query;
        }

        $terms = array_filter(explode(' ', $search));

        return $query->where(function ($q) use ($search, $terms) {
            // 1. Full phrase match across product fields, category, brand, and variants
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('sku', 'like', "%{$search}%")
              ->orWhere('barcode', 'like', "%{$search}%")
              ->orWhere('slug', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhereHas('category', function ($qc) use ($search) {
                  $qc->where('name', 'like', "%{$search}%");
              })
              ->orWhereHas('brand', function ($qb) use ($search) {
                  $qb->where('name', 'like', "%{$search}%");
              })
              ->orWhereHas('variants', function ($qv) use ($search) {
                  $qv->where('name', 'like', "%{$search}%")
                     ->orWhere('sku', 'like', "%{$search}%")
                     ->orWhere('barcode', 'like', "%{$search}%");
              });

            // 2. If search contains multiple words, match items containing all words across fields
            if (count($terms) > 1) {
                $q->orWhere(function ($subQ) use ($terms) {
                    foreach ($terms as $term) {
                        $subQ->where(function ($wordQ) use ($term) {
                            $wordQ->where('name', 'like', "%{$term}%")
                                  ->orWhere('sku', 'like', "%{$term}%")
                                  ->orWhere('barcode', 'like', "%{$term}%")
                                  ->orWhere('slug', 'like', "%{$term}%")
                                  ->orWhere('description', 'like', "%{$term}%")
                                  ->orWhereHas('category', function ($qc) use ($term) {
                                      $qc->where('name', 'like', "%{$term}%");
                                  })
                                  ->orWhereHas('brand', function ($qb) use ($term) {
                                      $qb->where('name', 'like', "%{$term}%");
                                  })
                                  ->orWhereHas('variants', function ($qv) use ($term) {
                                      $qv->where('name', 'like', "%{$term}%")
                                         ->orWhere('sku', 'like', "%{$term}%")
                                         ->orWhere('barcode', 'like', "%{$term}%");
                                  });
                        });
                    }
                });
            }
        });
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function getDiscountPercentAttribute(): float
    {
        if (!$this->compare_price || $this->compare_price <= $this->selling_price) {
            return 0;
        }
        return round((($this->compare_price - $this->selling_price) / $this->compare_price) * 100, 2);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->status === 'active';
    }
}
