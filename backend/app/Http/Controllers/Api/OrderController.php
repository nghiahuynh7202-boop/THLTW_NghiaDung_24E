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
    // Lấy danh sách đơn hàng
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::with(['details.product', 'user'])->latest('id');

        // Khách chỉ xem đơn của mình
        if ($userId = $request->input('user_id', $request->is('api/admin/*') ? null : $request->user()?->id)) {
            $query->where('user_id', $userId);
        }

        // Lọc theo trạng thái
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Tìm kiếm theo tên hoặc số điện thoại
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('id', $search);
            });
        }

        $perPage = (int) $request->input('per_page', 12);
        return OrderResource::collection($query->paginate($perPage));
    }

    // Tạo đơn hàng mới trong Transaction
    public function store(OrderRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $items = $validated['items'];

        $order = DB::transaction(function () use ($validated, $items, $request) {
            $subtotal = 0;
            $detailRecords = [];

            // 1. Tính tiền từng sản phẩm từ database
            foreach ($items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $unitPrice = (int) ($item['price'] ?? $product->price);
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

            // 2. Tính tổng tiền sau giảm giá và phí ship
            $discountAmount = (int) ($validated['discount_amount'] ?? 0);
            $shippingFee    = (int) ($validated['shipping_fee'] ?? 0);
            $total          = max(0, $subtotal - $discountAmount + $shippingFee);

            // 3. Tạo đơn hàng
            $order = Order::create([
                'user_id'         => $validated['user_id'] ?? $request->user()?->id,
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
            ]);

            // 4. Tạo chi tiết đơn hàng
            foreach ($detailRecords as $detail) {
                $detail['order_id'] = $order->id;
                OrderDetail::create($detail);
            }

            // 5. Tăng số lần sử dụng mã giảm giá nếu có
            if (! empty($validated['coupon_code'])) {
                ProductSale::where('code', $validated['coupon_code'])->increment('used_count');
            }

            // 6. Xóa giỏ hàng database nếu người dùng đã đăng nhập
            if (! empty($order->user_id)) {
                $orderedProductIds = array_column($items, 'product_id');
                Cart::where('user_id', $order->user_id)->whereIn('product_id', $orderedProductIds)->delete();
            }

            return $order;
        });

        return (new OrderResource($order->load(['details.product', 'user'])))
            ->additional(['message' => 'Đặt hàng thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    // Chi tiết 1 đơn hàng
    public function show($id): OrderResource
    {
        $order = Order::with(['details.product', 'user'])->findOrFail($id);
        return new OrderResource($order);
    }

    // Cập nhật trạng thái đơn hàng (Admin)
    public function update(OrderRequest $request, Order $order): JsonResponse
    {
        $order->update($request->validated());

        return (new OrderResource($order->load(['details.product', 'user'])))
            ->additional(['message' => 'Cập nhật đơn hàng thành công.'])
            ->response();
    }

    // Hủy đơn hàng (Khách hoặc Admin)
    public function cancel(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        if ($order->status >= 3 && $order->status != 5) {
            return response()->json(['message' => 'Đơn hàng đang giao hoặc đã hoàn thành, không thể hủy.'], 422);
        }

        $order->update([
            'status'        => 5, // 5: Đã hủy
            'cancel_reason' => $request->input('cancel_reason', 'Khách hàng yêu cầu hủy đơn'),
        ]);

        return (new OrderResource($order->load(['details.product', 'user'])))
            ->additional(['message' => 'Hủy đơn hàng thành công.'])
            ->response();
    }

    // Xóa đơn hàng (Admin)
    public function destroy(Order $order): JsonResponse
    {
        DB::transaction(function () use ($order) {
            $order->details()->delete();
            $order->delete();
        });

        return response()->json(['message' => 'Xóa đơn hàng thành công.']);
    }
}
