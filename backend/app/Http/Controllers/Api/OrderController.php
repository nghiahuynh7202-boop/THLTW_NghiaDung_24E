<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Product;
use App\Models\ProductSale;
use App\Models\User;
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

            // 3. Tạo đơn hàng (nếu user_id không tồn tại trong DB thì gán null để tránh lỗi khóa ngoại)
            $userId = $validated['user_id'] ?? $request->user()?->id;
            if ($userId && !User::where('id', $userId)->exists()) {
                $userId = null;
            }

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
            ]);

            // 4. Tạo chi tiết đơn hàng & TRỪ SỐ LƯỢNG TỒN KHO CỦA SẢN PHẨM
            foreach ($detailRecords as $detail) {
                $detail['order_id'] = $order->id;
                OrderDetail::create($detail);

                // Trừ tồn kho (qty) trong bảng products (không để âm)
                $product = Product::find($detail['product_id']);
                if ($product) {
                    $product->qty = max(0, (int) $product->qty - (int) $detail['qty']);
                    $product->save();
                }
            }

            // 5. Tăng số lần sử dụng mã giảm giá nếu có
            if (! empty($validated['coupon_code'])) {
                ProductSale::where('code', $validated['coupon_code'])->increment('used_count');
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

    // Hủy đơn hàng (Chỉ cho phép hủy khi đơn ở trạng thái 1: Chờ xác nhận)
    public function cancel(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);

        // Nếu đơn đã được xác nhận, đang đóng gói, đang giao hoặc đã giao thì không cho hủy
        if ($order->status != 1) {
            return response()->json([
                'message' => 'Đơn hàng đã được xác nhận hoặc đang giao, không thể hủy.'
            ], 422);
        }

        // Hoàn lại số lượng tồn kho cho các sản phẩm trong đơn
        foreach ($order->details as $item) {
            $product = Product::find($item->product_id);
            if ($product) {
                $product->qty = (int) $product->qty + (int) $item->qty;
                $product->save();
            }
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
