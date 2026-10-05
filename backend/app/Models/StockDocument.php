<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'stock_documents';

    const UPDATED_AT = null;

    protected $fillable = [
        'code',
        'type',
        'reason',
        'supplier_id',
        'note',
        'created_by',
    ];

    protected $casts = [
        'supplier_id' => 'integer',
        'created_by'  => 'integer',
        'created_at'  => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockDocumentItem::class, 'document_id');
    }

    public static function generateUniqueCode(string $type = 'in'): string
    {
        $prefix = strtoupper($type) === 'IN' ? 'NK' : 'XK';
        $date = date('Ymd');
        $baseCode = $prefix . '-' . $date . '-';

        $lastDoc = static::withTrashed()
            ->where('code', 'LIKE', $baseCode . '%')
            ->orderBy('id', 'desc')
            ->first();

        $num = 1;
        if ($lastDoc) {
            $parts = explode('-', $lastDoc->code);
            $lastNum = (int) end($parts);
            $num = $lastNum + 1;
        }

        return $baseCode . str_pad((string) $num, 3, '0', STR_PAD_LEFT);
    }
}
