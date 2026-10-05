<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Page extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pages';

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'content',
        'status',
    ];

    protected $casts = [
        'status'     => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function scopeActive(Builder $query): void
    {
        $query->where('status', 1);
    }

    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $slug = Str::slug($title);
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
