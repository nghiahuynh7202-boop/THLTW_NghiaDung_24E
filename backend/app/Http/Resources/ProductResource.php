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
            'qty'         => $this->qty,
            'image'       => $this->image ? asset('storage/' . $this->image) : null,
            'description' => $this->description,
            'status'      => $this->status,


            // Chỉ nạp khi controller gọi with()
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'brand'       => new BrandResource($this->whenLoaded('brand')),
        ];
    }
}