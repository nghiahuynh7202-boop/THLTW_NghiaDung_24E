<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SepayController extends Controller
{
    /**
     * POST /api/sepay/webhook — Webhook tự động nhận thông báo từ SePay khi có tiền vào tài khoản
     */
    public function webhook(Request $request): JsonResponse
    {
        // Nhận dữ liệu webhook từ SePay
        $data = $request->all();
        Log::info('SePay Webhook received:', $data);

        $content = $request->input('content') ?: ($request->input('description') ?: ($request->input('code') ?: ''));
        $transferAmount = (int) ($request->input('transferAmount') ?: $request->input('amount', 0));

        // Tìm mã đơn hàng trong nội dung chuyển khoản (VD: "HOA 15", "HOA15", "DH 15", "HOA #15")
        if (preg_match('/(?:HOA|DH)[\s_#]*(\d+)/i', $content, $matches)) {
            $orderId = (int) $matches[1];
            $order = Order::find($orderId);

            if ($order) {
                // Đánh dấu đơn hàng đã thanh toán thành công
                $order->update([
                    'payment_status' => 1,
                    'payment_method' => 'qr',
                ]);

                Log::info("SePay: Đơn hàng #{$orderId} đã được thanh toán thành công số tiền {$transferAmount}đ");

                return response()->json([
                    'success' => true,
                    'message' => 'Đã cập nhật trạng thái thanh toán đơn hàng.',
                    'order_id' => $orderId,
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Không tìm thấy đơn hàng tương ứng trong nội dung chuyển khoản hoặc bỏ qua.',
        ], 200);
    }

    /**
     * POST /api/sepay/mock-payment/{id} — Nút mô phỏng thanh toán thành công để test/báo cáo nhanh
     */
    public function mockPayment($id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->update([
            'payment_status' => 1,
            'payment_method' => 'qr',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mô phỏng ngân hàng chuyển tiền thành công!',
            'order'   => $order,
        ]);
    }

    /**
     * GET /api/orders/{id}/check-payment — Kiểm tra trạng thái thanh toán của đơn hàng
     */
    public function checkPayment($id): JsonResponse
    {
        $order = Order::findOrFail($id);

        return response()->json([
            'order_id'       => $order->id,
            'payment_status' => (int) $order->payment_status,
            'status'         => (int) $order->status,
        ]);
    }
}
