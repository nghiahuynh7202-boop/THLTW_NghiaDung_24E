<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * GET /api/orders (Client) hoặc GET /api/admin/orders (Admin)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::with(['details.product', 'user'])->latest('id');

        // Lọc theo user_id nếu có
        if ($userId = $request->input('user_id', $request->is('api/admin/*') ? null : $request->user()?->id)) {
            $query->where('user_id', $userId);
        }

        // Lọc theo trạng thái đơn hàng (Admin hoặc Client)
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Tìm kiếm theo tên / số điện thoại người nhận
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('id', $search);
            });
        }

        $perPage = (int) $request->input('per_page', 12);
        $orders = $query->paginate($perPage);

        return OrderResource::collection($orders);
    }

    /**
     * POST /api/orders hoặc POST /api/admin/orders — Tạo đơn hàng kèm chi tiết (order + orderdetail)
     */
    public function store(OrderRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $items = $validated['items'];

        $order = DB::transaction(function () use ($validated, $items, $request) {
            $subtotal = 0;
            $detailRecords = [];

            // 1. Duyệt qua từng sản phẩm và tính toán giá
            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $unitPrice = isset($item['price']) && $item['price'] !== null ? (int) $item['price'] : (int) $product->price;
                $qty = (int) $item['qty'];
                $amount = $unitPrice * $qty;
                $subtotal += $amount;

                $detailRecords[] = [
                    'product_id' => $product->id,
                    'price'      => $unitPrice,
                    'qty'        => $qty,
                    'amount'     => $amount,
                ];
            }

            // 2. Tính toán tổng tiền
            $discountAmount = (int) ($validated['discount_amount'] ?? 0);
            $shippingFee    = (int) ($validated['shipping_fee'] ?? 0);
            $total          = max(0, $subtotal - $discountAmount + $shippingFee);

            $rawUserId = $validated['user_id'] ?? $request->user()?->id;
            $userId = (!empty($rawUserId) && \App\Models\User::where('id', $rawUserId)->exists()) ? (int) $rawUserId : null;

            // 3. Tạo thông tin đơn hàng
            $order = Order::create([
                'user_id'         => $userId,
                'name'            => $validated['name'],
                'phone'           => $validated['phone'],
                'email'           => $validated['email'] ?? null,
                'address'         => $validated['address'],
                'note'            => $validated['note'] ?? null,
                'payment_method'  => $validated['payment_method'] ?? 'cod',
                'payment_status'  => $validated['payment_status'] ?? 0,
                'coupon_code'     => $validated['coupon_code'] ?? null,
                'discount_amount' => $discountAmount,
                'shipping_fee'    => $shippingFee,
                'total'           => $total,
                'status'          => 1, // 1: Chờ xác nhận
                'cancel_reason'   => null,
            ]);

            // 4. Tạo chi tiết đơn hàng (orderdetail)
            foreach ($detailRecords as $detail) {
                $detail['order_id'] = $order->id;
                OrderDetail::create($detail);
            }

            // 5. Cập nhật lượt sử dụng mã khuyến mãi nếu có
            if (! empty($validated['coupon_code'])) {
                ProductSale::where('code', $validated['coupon_code'])->increment('used_count');
            }

            // 6. Xoá các sản phẩm đã đặt khỏi giỏ hàng của người dùng (nếu có dùng bảng carts)
            if (! empty($order->user_id) && \Illuminate\Support\Facades\Schema::hasTable('carts')) {
                try {
                    $orderedProductIds = array_column($items, 'product_id');
                    Cart::where('user_id', $order->user_id)
                        ->whereIn('product_id', $orderedProductIds)
                        ->delete();
                } catch (\Throwable $e) {
                    // Bỏ qua nếu ứng dụng quản lý giỏ hàng phía frontend/localStorage
                }
            }

            return $order;
        });

        return (new OrderResource($order->load(['details.product', 'user'])))
            ->additional(['message' => 'Đặt hàng thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/orders/{order} hoặc GET /api/admin/orders/{order}
     */
    public function show($id): OrderResource
    {
        $order = Order::with(['details.product', 'user'])->findOrFail($id);

        return new OrderResource($order);
    }

    /**
     * PUT|PATCH /api/admin/orders/{order} — Cập nhật trạng thái / thông tin đơn hàng
     */
    public function update(OrderRequest $request, Order $order): JsonResponse
    {
        $data = $request->validated();
        $order->update($data);

        return (new OrderResource($order->load(['details.product', 'user'])))
            ->additional(['message' => 'Cập nhật đơn hàng thành công.'])
            ->response();
    }

    /**
     * PATCH /api/orders/{order}/cancel — Khách hàng hoặc Admin hủy đơn
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        $request->validate([
            'cancel_reason' => 'nullable|string|max:255',
        ], [
            'cancel_reason.max' => 'Lý do hủy đơn không vượt quá 255 ký tự.',
        ]);

        $order = Order::findOrFail($id);

        // Chỉ cho phép hủy khi đơn ở trạng thái 1 (Chờ xác nhận) hoặc 2 (Đang xử lý)
        if ($order->status >= 3 && $order->status != 5) {
            return response()->json([
                'message' => 'Đơn hàng đang giao hoặc đã hoàn thành, không thể hủy.',
            ], 422);
        }

        $order->update([
            'status'        => 5, // 5: Đã hủy
            'cancel_reason' => $request->input('cancel_reason', 'Khách hàng yêu cầu hủy đơn'),
        ]);

        return (new OrderResource($order->load(['details.product', 'user'])))
            ->additional(['message' => 'Hủy đơn hàng thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/orders/{order} — Xóa đơn hàng
     */
    public function destroy(Order $order): JsonResponse
    {
        DB::transaction(function () use ($order) {
            $order->details()->delete();
            $order->delete();
        });

        return response()->json([
            'message' => 'Xóa đơn hàng thành công.',
        ]);
    }
}
