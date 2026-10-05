<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'product_id',
        'qty',
        'price',
    ];

    protected $casts = [
        'user_id'    => 'integer',
        'product_id' => 'integer',
        'qty'        => 'integer',
        'price'      => 'integer',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function getSubtotalAttribute(): int
    {
        return (int) ($this->price * $this->qty);
    }
}
