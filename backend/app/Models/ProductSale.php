<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSale extends Model
{
    use HasFactory;

    protected $table = 'productsale';

    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'code',
        'apply_to',
        'product_id',
        'pricesale',
        'discount_type',
        'discount_value',
        'max_discount',
        'min_order',
        'usage_limit',
        'used_count',
        'date_begin',
        'date_end',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'product_id'     => 'integer',
            'pricesale'      => 'integer',
            'discount_value' => 'integer',
            'max_discount'   => 'integer',
            'min_order'      => 'integer',
            'usage_limit'    => 'integer',
            'used_count'     => 'integer',
            'status'         => 'integer',
            'date_begin'     => 'datetime',
            'date_end'       => 'datetime',
            'created_at'     => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function scopeActive(Builder $query): void
    {
        $now = now();
        $query->where('status', 1)
            ->where('date_begin', '<=', $now)
            ->where('date_end', '>=', $now);
    }
}
