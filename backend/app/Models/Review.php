<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';

    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'comment',
        'status',
    ];

    protected $casts = [
        'product_id' => 'integer',
        'user_id'    => 'integer',
        'rating'     => 'integer',
        'status'     => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Quan hệ với Sản phẩm
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    // Quan hệ với Người dùng
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scope lọc các đánh giá đang được hiển thị công khai
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}
