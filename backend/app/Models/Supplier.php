<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'suppliers';

    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'phone',
        'address',
        'status',
    ];

    protected $casts = [
        'status'     => 'integer',
        'created_at' => 'datetime',
    ];

    public function stockDocuments(): HasMany
    {
        return $this->hasMany(StockDocument::class);
    }

    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }
}
