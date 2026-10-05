<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id'    => $this->user_id,
            'product_id' => $this->product_id,
            'qty'        => $this->qty,
            'price'      => $this->price,
            'subtotal'   => (int) ($this->price * $this->qty),
            'product'    => $this->whenLoaded('product', function () {
                return [
                    'id'          => $this->product->id,
                    'name'        => $this->product->name,
                    'slug'        => $this->product->slug,
                    'price'       => $this->product->price,
                    'qty'         => $this->product->qty,
                    'image'       => $this->product->image ? asset('storage/' . $this->product->image) : null,
                    'status'      => $this->product->status,
                ];
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
