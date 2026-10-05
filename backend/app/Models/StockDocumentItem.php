<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockDocumentItem extends Model
{
    use HasFactory;

    protected $table = 'stock_document_items';

    public $timestamps = false;

    protected $fillable = [
        'document_id',
        'product_id',
        'qty',
        'unit_cost',
    ];

    protected $casts = [
        'document_id' => 'integer',
        'product_id'  => 'integer',
        'qty'         => 'integer',
        'unit_cost'   => 'integer',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(StockDocument::class, 'document_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
