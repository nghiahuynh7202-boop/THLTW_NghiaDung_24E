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
     * 1. Lấy danh sách khuyến mãi (Admin xem tất cả, Client chỉ xem khuyến mãi đang chạy)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = ProductSale::with('product')->latest('id');

        // Nếu là khách hàng xem thì chỉ lấy khuyến mãi đang hiệu lực
        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        // Tìm kiếm theo tên hoặc mã code
        if ($request->filled('keyword')) {
            $kw = $request->input('keyword');
            $query->where(function ($q) use ($kw) {
                $q->where('name', 'like', "%{$kw}%")
                  ->orWhere('code', 'like', "%{$kw}%");
            });
        }

        // Lọc theo trạng thái (1: đang chạy, 0: tạm tắt)
        if ($request->filled('status')) {
            $query->where('status', (int) $request->input('status'));
        }

        // Lọc theo loại áp dụng: 'order' (coupon đơn hàng) hoặc 'product' (giảm giá sản phẩm)
        if ($request->filled('apply_to')) {
            $query->where('apply_to', $request->input('apply_to'));
        }

        $perPage = (int) $request->input('per_page', 10);
        return ProductSaleResource::collection($query->paginate($perPage));
    }

    /**
     * 2. Thêm mới chương trình khuyến mãi / mã giảm giá
     */
    public function store(ProductSaleRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Tự động viết hoa mã code nếu có nhập
        if (! empty($data['code'])) {
            $data['code'] = strtoupper(trim($data['code']));
        }

        $sale = ProductSale::create($data);

        return (new ProductSaleResource($sale->load('product')))
            ->additional(['message' => 'Thêm khuyến mãi thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * 3. Xem chi tiết một khuyến mãi
     */
    public function show($id): ProductSaleResource
    {
        $sale = ProductSale::with('product')->findOrFail($id);

        return new ProductSaleResource($sale);
    }

    /**
     * 4. Cập nhật thông tin khuyến mãi
     */
    public function update(ProductSaleRequest $request, ProductSale $productsale): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['code'])) {
            $data['code'] = strtoupper(trim($data['code']));
        }

        $productsale->update($data);

        return (new ProductSaleResource($productsale->load('product')))
            ->additional(['message' => 'Cập nhật khuyến mãi thành công.'])
            ->response();
    }

    /**
     * 5. Xóa tạm khuyến mãi (vào thùng rác)
     */
    public function destroy(ProductSale $productsale): JsonResponse
    {
        $productsale->delete();

        return response()->json([
            'message' => 'Xóa tạm khuyến mãi thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * 6. Danh sách khuyến mãi trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 10);
        $sales = ProductSale::onlyTrashed()
            ->with('product')
            ->latest('deleted_at')
            ->paginate($perPage);

        return ProductSaleResource::collection($sales);
    }

    /**
     * 7. Khôi phục khuyến mãi từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $sale = ProductSale::onlyTrashed()->findOrFail($id);
        $sale->restore();

        return (new ProductSaleResource($sale->load('product')))
            ->additional(['message' => 'Khôi phục khuyến mãi thành công.'])
            ->response();
    }

    /**
     * 8. Xóa vĩnh viễn khuyến mãi khỏi database
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $sale = ProductSale::withTrashed()->findOrFail($id);
        $sale->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn khuyến mãi thành công.',
        ]);
    }

    /**
     * 6. Kiểm tra mã giảm giá khi khách đặt hàng (Client)
     */
    public function checkCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'nullable|numeric|min:0',
        ], [
            'code.required' => 'Vui lòng nhập mã giảm giá.',
        ]);

        $code = strtoupper(trim($request->input('code')));
        $subtotal = (float) $request->input('subtotal', 0);

        // Tìm mã trong CSDL đang còn hiệu lực
        $sale = ProductSale::where('code', $code)->active()->first();

        if (! $sale) {
            return response()->json([
                'valid'   => false,
                'message' => 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn.',
            ], 404);
        }

        // Kiểm tra giới hạn số lần sử dụng
        if ($sale->usage_limit !== null && $sale->used_count >= $sale->usage_limit) {
            return response()->json([
                'valid'   => false,
                'message' => 'Mã khuyến mãi đã hết lượt sử dụng.',
            ], 400);
        }

        // Kiểm tra đơn hàng tối thiểu
        if ($subtotal < $sale->min_order) {
            return response()->json([
                'valid'   => false,
                'message' => 'Đơn hàng tối thiểu để áp dụng mã là ' . number_format($sale->min_order) . 'đ.',
            ], 400);
        }

        // Tính số tiền được giảm
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
