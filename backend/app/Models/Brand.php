<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'brands';

    public static function bootSoftDeletes(): void
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasColumn('brands', 'deleted_at')) {
                static::addGlobalScope(new \Illuminate\Database\Eloquent\SoftDeletingScope);
            }
        } catch (\Throwable $e) {
            // Ignore
        }
    }

    // Bảng chỉ có cột created_at, tắt chế độ tự động cập nhật updated_at
    const UPDATED_AT = null;

    
    protected $fillable = [
        'name',
        'slug',
        'image',
        'description',
        'status',
    ];

    protected $casts = [
        'status'     => 'integer',
        'created_at' => 'datetime',
    ];


    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }


    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }


     public static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {

        $slug = Str::slug($name);

        $slugGoc = $slug;
        $so = 1;


        while (true) {


            $query = static::withTrashed()->where('slug', $slug);


            if ($ignoreId != null) {
                $query = $query->where('id', '!=', $ignoreId);
            }


            if ($query->exists() == false) {
                break;
            }


            $slug = $slugGoc . '-' . $so;
            $so = $so + 1;
        }

        return $slug;
    }
}