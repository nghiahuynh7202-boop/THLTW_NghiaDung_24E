<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'code'        => $this->code,
            'type'        => $this->type,
            'reason'      => $this->reason,
            'supplier_id' => $this->supplier_id,
            'supplier'    => new SupplierResource($this->whenLoaded('supplier')),
            'note'        => $this->note,
            'created_by'  => $this->created_by,
            'creator'     => new UserResource($this->whenLoaded('creator')),
            'items'       => StockDocumentItemResource::collection($this->whenLoaded('items')),
            'total_items' => $this->whenLoaded('items', fn () => $this->items->sum('qty')),
            'total_value' => $this->whenLoaded('items', fn () => $this->items->sum(fn ($i) => $i->qty * $i->unit_cost)),
            'created_at'  => $this->created_at?->format('Y-m-d H:i:s'),
            'deleted_at'  => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
