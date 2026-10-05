<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDetail extends Model
{
    use HasFactory;

    protected $table = 'orderdetail';

    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'price',
        'qty',
        'amount',
    ];

    protected function casts(): array
    {
        return [
            'order_id'   => 'integer',
            'product_id' => 'integer',
            'price'      => 'integer',
            'qty'        => 'integer',
            'amount'     => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
