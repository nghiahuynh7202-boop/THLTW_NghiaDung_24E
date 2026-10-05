<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'price',
        'qty',
        'image',
        'description',
        'status',
    ];

    protected $casts = [
        'category_id' => 'integer',
        'brand_id'    => 'integer',
        'price'       => 'integer',
        'qty'         => 'integer',
        'status'      => 'integer',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
        'deleted_at'  => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(ProductSale::class, 'product_id');
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class, 'product_id');
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }

    public static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (true) {
            $query = static::withTrashed()->where('slug', $slug);
            if ($ignoreId !== null) {
                $query->where('id', '!=', $ignoreId);
            }
            if (! $query->exists()) {
                return $slug;
            }
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }
    }
}
