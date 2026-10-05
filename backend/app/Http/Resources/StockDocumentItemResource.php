<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockDocumentItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'document_id' => $this->document_id,
            'product_id'  => $this->product_id,
            'product'     => new ProductResource($this->whenLoaded('product')),
            'qty'         => $this->qty,
            'unit_cost'   => $this->unit_cost,
            'total_cost'  => $this->qty * $this->unit_cost,
        ];
    }
}
