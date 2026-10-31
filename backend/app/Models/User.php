<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * File này làm gì: Model ánh xạ bảng `users` trong cơ sở dữ liệu.
 * Quản lý thông tin tài khoản, phân quyền (role: 'admin' | 'customer') và cấp token qua Sanctum.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'status'            => 'integer',
        ];
    }

    // Quan hệ: Một người dùng có nhiều đơn hàng
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id');
    }

    // Quan hệ: Một người dùng có thể gửi nhiều liên hệ
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    // Quan hệ: Một người dùng có thể viết nhiều bài viết (tin tức)
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    // Scope lọc tài khoản đang hoạt động (status = 1)
    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}
