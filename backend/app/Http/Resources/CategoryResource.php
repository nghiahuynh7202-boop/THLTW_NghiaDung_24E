<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'parent_id'   => $this->parent_id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'image'       => $this->image ? (str_starts_with($this->image, 'http') ? $this->image : asset('storage/' . $this->image)) : null,
            'is_featured' => (bool) $this->is_featured,
            'status'      => (int) $this->status,
            'created_at'  => $this->created_at?->format('Y-m-d H:i:s'),

            // chỉ có khi controller đã with('children')
            'children'    => CategoryResource::collection(
                $this->whenLoaded('children')
            ),
        ];
    }
}