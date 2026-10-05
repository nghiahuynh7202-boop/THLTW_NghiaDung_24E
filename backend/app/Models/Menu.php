<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'menus';

    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'link',
        'parent_id',
        'order_num',
        'status',
    ];

    protected $casts = [
        'parent_id'  => 'integer',
        'order_num'  => 'integer',
        'status'     => 'integer',
        'created_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id');
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}
