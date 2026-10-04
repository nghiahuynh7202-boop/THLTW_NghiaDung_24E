<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'user_id'    => $this->user_id,
            'user'       => new UserResource($this->whenLoaded('user')),
            'name'       => $this->name,
            'phone'      => $this->phone,
            'email'      => $this->email,
            'message'    => $this->message,
            'reply'      => $this->reply,
            'replied_at' => $this->replied_at?->format('Y-m-d H:i:s'),
            'status'     => $this->status,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
