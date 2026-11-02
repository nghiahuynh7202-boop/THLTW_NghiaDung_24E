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
        $subject = (int) $this->order->payment_status === 1
            ? '🌸 Xác nhận thanh toán thành công - Đơn hàng #' . $this->order->id
            : '🌸 Xác nhận đặt hàng thành công (COD) - Đơn hàng #' . $this->order->id;

        return new Envelope(
            subject: $subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_placed',
        );
    }
}
