<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SepayController extends Controller
{
    // Webhook tự động nhận thông báo biến động số dư từ SePay
    public function webhook(Request $request): JsonResponse
    {
        $content = $request->input('content', '');
        $transferAmount = (int) $request->input('transferAmount', 0);

        // Tìm mã đơn hàng trong nội dung chuyển khoản (VD: HOA 15, DH 15)
        if (preg_match('/(?:HOA|DH)[\s_#]*(\d+)/i', $content, $matches)) {
            $orderId = (int) $matches[1];
            $order = Order::find($orderId);

            if ($order) {
                // Cập nhật trạng thái đã thanh toán
                $order->update([
                    'payment_status' => 1,
                    'payment_method' => 'qr',
                ]);

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
        $order->update([
            'payment_status' => 1,
            'payment_method' => 'qr',
        ]);

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

        return response()->json([
            'order_id'       => $order->id,
            'payment_status' => (int) $order->payment_status,
            'status'         => (int) $order->status,
        ]);
    }
}
