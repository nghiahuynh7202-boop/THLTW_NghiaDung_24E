<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $table = 'order';

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'email',
        'address',
        'note',
        'payment_method',
        'payment_status',
        'coupon_code',
        'discount_amount',
        'shipping_fee',
        'total',
        'status',
        'cancel_reason',
    ];

    protected function casts(): array
    {
        return [
            'user_id'         => 'integer',
            'payment_status'  => 'integer',
            'discount_amount' => 'integer',
            'shipping_fee'    => 'integer',
            'total'           => 'integer',
            'status'          => 'integer',
            'created_at'      => 'datetime',
            'updated_at'      => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function details(): HasMany
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }
}
