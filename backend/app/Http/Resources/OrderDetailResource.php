<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'order_id'   => $this->order_id,
            'product_id' => $this->product_id,
            'price'      => $this->price,
            'qty'        => $this->qty,
            'amount'     => $this->amount,
            'product'    => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
