<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'category_id' => $this->category_id,
            'brand_id'    => $this->brand_id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'price'       => $this->price,
            'sale_price'  => $this->relationLoaded('sales')
                ? ($this->sales?->first(fn ($s) => (int)$s->status === 1)?->pricesale ?? null)
                : ($this->attributes['sale_price'] ?? \App\Models\ProductSale::where('product_id', $this->id)->where('status', 1)->value('pricesale')),
            'qty'         => $this->qty,
            'image'       => $this->image ? (str_starts_with($this->image, 'http') ? $this->image : asset('storage/' . ltrim($this->image, '/'))) : null,
            'description' => $this->description,
            'is_featured' => (int)($this->is_featured ?? 0),
            'status'      => $this->status,
            'sold_count'  => (int) ($this->sold_count ?? 0),
            'deleted_at'  => $this->deleted_at,
            'created_at'  => $this->created_at,


            // Chỉ nạp khi controller gọi with()
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'brand'       => new BrandResource($this->whenLoaded('brand')),
        ];
    }
}