<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Mail\OrderPlacedMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SepayController extends Controller
{
    // Webhook tự động nhận thông báo biến động số dư từ SePay
    public function webhook(Request $request): JsonResponse
    {
        Log::info('SePay Webhook Received:', $request->all());

        // Lấy nội dung chuyển khoản từ mọi trường có thể có của SePay
        $content = $request->input('content', '') . ' ' . $request->input('description', '') . ' ' . $request->input('code', '');
        $transferAmount = (int) $request->input('transferAmount', 0);

        // Tìm mã đơn hàng trong nội dung chuyển khoản (VD: HOA 15, DH 15, DH15)
        if (preg_match('/(?:HOA|DH)[\s_#]*(\d+)/i', $content, $matches)) {
            $orderId = (int) $matches[1];
            $order = Order::find($orderId);

            if ($order) {
                $wasAlreadyPaid = ((int) $order->payment_status === 1);

                // Cập nhật trạng thái đã thanh toán
                $order->update([
                    'payment_status' => 1,
                    'payment_method' => 'qr',
                ]);

                Log::info("SePay Webhook Success: Order #{$orderId} marked as paid.");

                // Gửi email xác nhận đơn hàng về Gmail của khách KHI THANH TOÁN THÀNH CÔNG (nếu chưa gửi)
                if (! $wasAlreadyPaid && ! empty($order->email)) {
                    try {
                        Mail::to($order->email)->send(new OrderPlacedMail($order));
                        Log::info("SePay Webhook: Đã gửi email xác nhận thanh toán đơn #{$orderId} tới {$order->email}");
                    } catch (\Throwable $e) {
                        Log::error("SePay Webhook: Lỗi gửi email cho đơn #{$orderId}: " . $e->getMessage());
                    }
                }

                return response()->json([
                    'success'  => true,
                    'message'  => 'Đã xác nhận thanh toán đơn hàng.',
                    'order_id' => $orderId,
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Không tìm thấy đơn hàng tương ứng.',
        ]);
    }

    // Nút mô phỏng thanh toán thành công để test/báo cáo khi không có tài khoản thật
    public function mockPayment($id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $wasAlreadyPaid = ((int) $order->payment_status === 1);

        $order->update([
            'payment_status' => 1,
            'payment_method' => 'qr',
        ]);

        // Gửi email về Gmail nếu chưa gửi
        if (! $wasAlreadyPaid && ! empty($order->email)) {
            try {
                Mail::to($order->email)->send(new OrderPlacedMail($order));
                Log::info("Mock Payment: Đã gửi email xác nhận thanh toán đơn #{$id} tới {$order->email}");
            } catch (\Throwable $e) {
                Log::error("Mock Payment: Lỗi gửi email cho đơn #{$id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Mô phỏng thanh toán thành công!',
            'order'   => $order,
        ]);
    }

    // Kiểm tra trạng thái thanh toán của đơn hàng (dùng cho polling)
    public function checkPayment($id): JsonResponse
    {
        $order = Order::findOrFail($id);

        \Illuminate\Support\Facades\Log::info("SePay Check Payment Polling: Order #{$id} payment_status = {$order->payment_status}");

        return response()->json([
            'order_id'       => $order->id,
            'payment_status' => (int) $order->payment_status,
            'status'         => (int) $order->status,
        ]);
    }
}
