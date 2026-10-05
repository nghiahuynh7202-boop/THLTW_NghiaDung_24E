<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostTopicResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'status'      => $this->status,
            'posts_count' => $this->whenCounted('posts'),
            'created_at'  => $this->created_at?->format('Y-m-d H:i:s'),
            'deleted_at'  => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
