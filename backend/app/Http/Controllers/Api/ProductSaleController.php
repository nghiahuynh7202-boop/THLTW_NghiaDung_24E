<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductSaleRequest;
use App\Http\Resources\ProductSaleResource;
use App\Models\ProductSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductSaleController extends Controller
{
    /**
     * GET /api/productsales (Client) hoặc GET /api/admin/productsales (Admin)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = ProductSale::with('product')->latest('id');

        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        $perPage = (int) $request->input('per_page', 12);
        $sales = $query->paginate($perPage);

        return ProductSaleResource::collection($sales);
    }

    /**
     * POST /api/admin/productsales
     */
    public function store(ProductSaleRequest $request): JsonResponse
    {
        $data = $request->validated();
        $sale = ProductSale::create($data);

        return (new ProductSaleResource($sale->load('product')))
            ->additional(['message' => 'Thêm khuyến mãi thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/productsales/{productsale} hoặc GET /api/admin/productsales/{productsale}
     */
    public function show($id): ProductResource|ProductSaleResource
    {
        $sale = ProductSale::with('product')->findOrFail($id);

        return new ProductSaleResource($sale);
    }

    /**
     * PUT|PATCH /api/admin/productsales/{productsale}
     */
    public function update(ProductSaleRequest $request, ProductSale $productsale): JsonResponse
    {
        $data = $request->validated();
        $productsale->update($data);

        return (new ProductSaleResource($productsale->load('product')))
            ->additional(['message' => 'Cập nhật khuyến mãi thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/productsales/{productsale}
     */
    public function destroy(ProductSale $productsale): JsonResponse
    {
        $productsale->delete();

        return response()->json([
            'message' => 'Xóa khuyến mãi thành công.',
        ]);
    }

    /**
     * POST /api/productsales/check-coupon — Kiểm tra mã giảm giá hợp lệ cho Client
     */
    public function checkCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'      => 'required|string',
            'subtotal'  => 'nullable|numeric|min:0',
        ], [
            'code.required' => 'Vui lòng nhập mã giảm giá.',
        ]);

        $code = trim($request->input('code'));
        $subtotal = (float) $request->input('subtotal', 0);

        $sale = ProductSale::where('code', $code)
            ->active()
            ->first();

        if (! $sale) {
            return response()->json([
                'valid'   => false,
                'message' => 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn sử dụng.',
            ], 404);
        }

        if ($sale->usage_limit !== null && $sale->used_count >= $sale->usage_limit) {
            return response()->json([
                'valid'   => false,
                'message' => 'Mã khuyến mãi đã hết lượt sử dụng.',
            ], 400);
        }

        if ($subtotal < $sale->min_order) {
            return response()->json([
                'valid'   => false,
                'message' => 'Đơn hàng tối thiểu để áp dụng mã là ' . number_format($sale->min_order) . 'đ.',
            ], 400);
        }

        // Tính số tiền giảm
        $discountAmount = 0;
        if ($sale->discount_type === 'percent') {
            $discountAmount = ($subtotal * $sale->discount_value) / 100;
            if ($sale->max_discount > 0 && $discountAmount > $sale->max_discount) {
                $discountAmount = $sale->max_discount;
            }
        } elseif ($sale->discount_type === 'amount') {
            $discountAmount = $sale->discount_value;
        }

        return response()->json([
            'valid'           => true,
            'message'         => 'Áp dụng mã khuyến mãi thành công!',
            'coupon'          => new ProductSaleResource($sale),
            'discount_amount' => (int) $discountAmount,
        ]);
    }
}
