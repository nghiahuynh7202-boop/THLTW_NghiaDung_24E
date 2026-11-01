<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPlacedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    public function __construct(Order $order)
    {
        // Nạp chi tiết sản phẩm và thông tin người dùng
        $this->order = $order->loadMissing(['details.product', 'user']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🌸 Xác nhận đặt hàng thành công - Đơn hàng #' . $this->order->id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_placed',
        );
    }
}
