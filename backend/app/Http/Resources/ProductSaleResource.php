<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductSaleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'code'           => $this->code,
            'apply_to'       => $this->apply_to,
            'product_id'     => $this->product_id,
            'pricesale'      => $this->pricesale,
            'discount_type'  => $this->discount_type,
            'discount_value' => $this->discount_value,
            'max_discount'   => $this->max_discount,
            'min_order'      => $this->min_order,
            'usage_limit'    => $this->usage_limit,
            'used_count'     => $this->used_count,
            'date_begin'     => $this->date_begin?->format('Y-m-d H:i:s'),
            'date_end'       => $this->date_end?->format('Y-m-d H:i:s'),
            'status'         => $this->status,
            'created_at'     => $this->created_at?->format('Y-m-d H:i:s'),

            // Nạp sản phẩm liên kết nếu có
            'product'        => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
