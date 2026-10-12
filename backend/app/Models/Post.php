<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'posts';

    public static function bootSoftDeletes(): void
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasColumn('posts', 'deleted_at')) {
                static::addGlobalScope(new \Illuminate\Database\Eloquent\SoftDeletingScope);
            }
        } catch (\Throwable $e) {
            // Ignore
        }
    }

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'topic_id',
        'title',
        'slug',
        'image',
        'summary',
        'content',
        'status',
    ];

    protected $casts = [
        'user_id'    => 'integer',
        'topic_id'   => 'integer',
        'status'     => 'integer',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class)->withoutGlobalScopes();
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(PostTopic::class, 'topic_id');
    }

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
