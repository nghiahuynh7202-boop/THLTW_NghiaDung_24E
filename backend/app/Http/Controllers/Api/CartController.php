<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CartRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * GET /api/cart — Lấy danh sách sản phẩm trong giỏ hàng của user
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $cartItems = Cart::with('product')
            ->where('user_id', $userId)
            ->latest('id')
            ->get();

        $totalItems = $cartItems->count();
        $totalQty = $cartItems->sum('qty');
        $totalAmount = $cartItems->sum(function ($item) {
            return $item->price * $item->qty;
        });

        return response()->json([
            'data'         => CartResource::collection($cartItems),
            'total_items'  => $totalItems,
            'total_qty'    => (int) $totalQty,
            'total_amount' => (int) $totalAmount,
        ]);
    }

    /**
     * POST /api/cart — Thêm sản phẩm vào giỏ hàng
     */
    public function store(CartRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $productId = (int) $request->input('product_id');
        $qty = (int) $request->input('qty', 1);

        $product = Product::findOrFail($productId);

        // Kiểm tra sản phẩm đã có trong giỏ hàng của user chưa
        $cartItem = Cart::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($cartItem) {
            // Đã tồn tại -> cộng dồn số lượng và cập nhật giá mới nhất
            $cartItem->qty += $qty;
            $cartItem->price = $product->price;
            $cartItem->save();
        } else {
            // Chưa có -> tạo mới
            $cartItem = Cart::create([
                'user_id'    => $userId,
                'product_id' => $productId,
                'qty'        => $qty,
                'price'      => $product->price,
            ]);
        }

        $cartItem->load('product');

        return (new CartResource($cartItem))
            ->additional(['message' => 'Đã thêm sản phẩm vào giỏ hàng thành công.'])
            ->response()
            ->setStatusCode(200);
    }

    /**
     * PUT /api/cart/{id} — Cập nhật số lượng của 1 mục trong giỏ
     */
    public function update(CartRequest $request, $id): JsonResponse
    {
        $userId = $request->user()->id;
        $qty = (int) $request->input('qty');

        $cartItem = Cart::where('user_id', $userId)->findOrFail($id);

        $cartItem->update([
            'qty' => $qty,
        ]);

        $cartItem->load('product');

        return (new CartResource($cartItem))
            ->additional(['message' => 'Cập nhật số lượng giỏ hàng thành công.'])
            ->response();
    }

    /**
     * DELETE /api/cart/{id} — Xóa 1 sản phẩm khỏi giỏ hàng
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $userId = $request->user()->id;

        $cartItem = Cart::where('user_id', $userId)->findOrFail($id);
        $cartItem->delete();

        return response()->json([
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng.',
        ]);
    }

    /**
     * DELETE /api/cart — Xóa toàn bộ giỏ hàng
     */
    public function clear(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        Cart::where('user_id', $userId)->delete();

        return response()->json([
            'message' => 'Đã xóa toàn bộ sản phẩm trong giỏ hàng.',
        ]);
    }
}
