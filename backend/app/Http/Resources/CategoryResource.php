<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imageUrl = null;
        if ($this->image) {
            $imageUrl = str_starts_with($this->image, 'http')
                ? $this->image
                : asset('storage/'.ltrim($this->image, '/'));
        }

        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image' => $imageUrl,
            'is_featured' => (bool) $this->is_featured,
            'status' => (int) $this->status,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
;