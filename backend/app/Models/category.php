<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    // Bảng chỉ có cột created_at, tắt chế độ tự động cập nhật updated_at
    const UPDATED_AT = null;

    /**
     * Các cột được phép gán dữ liệu hàng loạt
     */
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'image',
        'is_featured',
        'status',
    ];

    /**
     * Ép kiểu dữ liệu
     */
    protected $casts = [
        'parent_id'   => 'integer',
        'is_featured' => 'boolean',
        'status'      => 'integer',
        'created_at'  => 'datetime',
    ];

    /**
     * Quan hệ: Danh mục cha
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Quan hệ: Danh mục con
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    /**
     * Scope: Lọc danh mục đang hoạt động (status = 1)
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }

    /**
     * Scope: Lọc danh mục nổi bật (is_featured = 1)
     */
    public function scopeFeatured(Builder $query): void
    {
        $query->where('is_featured', 1);
    }
}