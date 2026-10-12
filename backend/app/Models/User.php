<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'users';

    public static function bootSoftDeletes(): void
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'deleted_at')) {
                static::addGlobalScope(new \Illuminate\Database\Eloquent\SoftDeletingScope);
            }
        } catch (\Throwable $e) {
            // Ignore schema error if table not ready
        }
    }

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
            'created_at'        => 'datetime',
            'updated_at'        => 'datetime',
        ];
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function stockDocuments(): HasMany
    {
        return $this->hasMany(StockDocument::class, 'created_by');
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}
