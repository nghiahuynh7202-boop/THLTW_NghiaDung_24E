<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $table = 'banners';

    const UPDATED_AT = null;

    protected $fillable = [
        'image',
        'link',
        'order_num',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'order_num'  => 'integer',
            'status'     => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}
