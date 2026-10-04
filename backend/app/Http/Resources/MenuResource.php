<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'link'       => $this->link,
            'parent_id'  => $this->parent_id,
            'order_num'  => $this->order_num,
            'status'     => $this->status,
            'parent'     => new MenuResource($this->whenLoaded('parent')),
            'children'   => MenuResource::collection($this->whenLoaded('children')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
