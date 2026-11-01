<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id'    => $this->user_id,
            'topic_id'   => $this->topic_id,
            'title'      => $this->title,
            'slug'       => $this->slug,
            'image'      => $this->image ? (str_starts_with($this->image, 'http') ? $this->image : asset('storage/' . ltrim($this->image, '/'))) : null,
            'summary'    => $this->summary,
            'content'    => $this->content,
            'status'     => $this->status,
            'topic'      => new PostTopicResource($this->whenLoaded('topic')),
            'user'       => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
