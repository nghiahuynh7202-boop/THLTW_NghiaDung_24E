<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Nhãn trạng thái đơn hàng thân thiện
        $statusLabels = [
            1 => 'Chờ xác nhận',
            2 => 'Đang xử lý',
            3 => 'Đang giao hàng',
            4 => 'Đã giao thành công',
            5 => 'Đã hủy',
        ];

        return [
            'id'              => $this->id,
            'user_id'         => $this->user_id,
            'name'            => $this->name,
            'phone'           => $this->phone,
            'email'           => $this->email,
            'address'         => $this->address,
            'note'            => $this->note,
            'payment_method'  => $this->payment_method,
            'payment_status'  => $this->payment_status,
            'coupon_code'     => $this->coupon_code,
            'discount_amount' => $this->discount_amount,
            'shipping_fee'    => $this->shipping_fee,
            'total'           => $this->total,
            'status'          => $this->status,
            'status_label'    => $statusLabels[$this->status] ?? 'Không xác định',
            'cancel_reason'   => $this->cancel_reason,
            'created_at'      => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'      => $this->updated_at?->format('Y-m-d H:i:s'),

            // Nạp chi tiết và người dùng
            'details'         => OrderDetailResource::collection($this->whenLoaded('details')),
            'user'            => $this->whenLoaded('user'),
        ];
    }
}
