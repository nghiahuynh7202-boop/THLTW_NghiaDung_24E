<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'contacts';

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'email',
        'message',
        'reply',
        'replied_at',
        'status',
    ];

    protected $casts = [
        'user_id'    => 'integer',
        'replied_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread(Builder $query): void
    {
        $query->where('status', 'chua_xem');
    }
}
