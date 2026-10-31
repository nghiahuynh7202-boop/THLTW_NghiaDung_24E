<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{

public function index(Request $request)
{
    $query = Product::with(['category', 'brand', 'sales'])->latest('id');

    
    if (! $request->is('api/admin/*')) {
        $query->active();
    }

    // Lọc theo category_id và loại trừ sản phẩm hiện tại (dùng cho sản phẩm liên quan)
    if ($request->filled('category_id')) {
        $query->where('category_id', $request->input('category_id'));
    }
    if ($request->filled('exclude_id')) {
        $query->where('id', '!=', $request->input('exclude_id'));
    }

    $perPage = (int) $request->input('per_page', 12);
    $products = $query->paginate($perPage);

    return ProductResource::collection($products);
}

    public function store(ProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Product::uniqueSlug($data['name']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $salePrice = $data['sale_price'] ?? null;
        unset($data['sale_price']);

        $product = Product::create($data);

        // Lưu thông tin khuyến mãi vào bảng productsale nếu có nhập sale_price
        if ($salePrice !== null && (float)$salePrice > 0) {
            \App\Models\ProductSale::create([
                'name'       => 'Khuyến mãi ' . $product->name,
                'product_id' => $product->id,
                'pricesale'  => (int)$salePrice,
                'apply_to'   => 'product',
                'date_begin' => now(),
                'date_end'   => now()->addYears(1),
                'status'     => 1,
            ]);
        }

        return (new ProductResource($product->load(['category', 'brand', 'sales'])))
            ->additional(['message' => 'Thêm sản phẩm thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/products/{product} hoặc GET /api/products/{product} — Chi tiết sản phẩm
     */
    public function show($id): ProductResource
    {
        $product = Product::with(['category', 'brand', 'sales'])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return new ProductResource($product);
    }

    /**
     * PUT|PATCH /api/admin/products/{product} — Cập nhật sản phẩm
     */
    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        // Không gửi slug thì giữ nguyên slug cũ, gửi slug rỗng thì tạo lại từ tên
        if (array_key_exists('slug', $data) && empty($data['slug'])) {
            $data['slug'] = Product::uniqueSlug($data['name'] ?? $product->name, $product->id);
        }

        if ($request->hasFile('image')) {
            // Xóa ảnh cũ để không rác storage
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        } else {
            unset($data['image']); // Không gửi ảnh mới thì giữ nguyên ảnh cũ
        }

        $salePrice = $data['sale_price'] ?? null;
        unset($data['sale_price']);

        $product->update($data);

        // Cập nhật hoặc tạo mới bản ghi khuyến mãi
        if ($salePrice !== null && (float)$salePrice > 0) {
            \App\Models\ProductSale::updateOrCreate(
                ['product_id' => $product->id, 'apply_to' => 'product'],
                [
                    'name'       => 'Khuyến mãi ' . $product->name,
                    'pricesale'  => (int)$salePrice,
                    'date_begin' => now(),
                    'date_end'   => now()->addYears(1),
                    'status'     => 1,
                ]
            );
        }

        return (new ProductResource($product->load(['category', 'brand', 'sales'])))
            ->additional(['message' => 'Cập nhật sản phẩm thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/products/{product} — Xóa tạm sản phẩm (vào thùng rác)
     */
public function destroy(Product $product): JsonResponse
{
    $product->update(['status' => 0]);   
    $product->delete();               

    return response()->json([
        'message' => 'Xóa tạm sản phẩm thành công (đã chuyển vào thùng rác).',
    ]);
}

    /**
     * GET /api/admin/products/trash — Danh sách sản phẩm trong thùng rác
     */
public function trash(Request $request)
{
    $perPage = (int) $request->input('per_page', 12);
    $products = Product::onlyTrashed()
        ->with(['category', 'brand', 'sales'])
        ->latest('deleted_at')
        ->paginate($perPage);

    return ProductResource::collection($products);
}

    /**
     * PATCH /api/admin/products/{id}/restore — Khôi phục sản phẩm từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->update(['status' => 1]);
        $product->restore();

        return (new ProductResource($product->load(['category', 'brand'])))
            ->additional(['message' => 'Khôi phục sản phẩm thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/products/{id}/force — Xóa vĩnh viễn sản phẩm
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $product = Product::withTrashed()->findOrFail($id);

        try {
            // Xóa dữ liệu liên quan ở bảng productsale và cart để tránh lỗi khóa ngoại
            \App\Models\ProductSale::where('product_id', $product->id)->delete();
            \App\Models\Cart::where('product_id', $product->id)->delete();
        } catch (\Throwable $e) {
            // Bỏ qua nếu bảng không tồn tại hoặc không có quan hệ
        }

        // Xóa file ảnh khỏi storage khi xóa vĩnh viễn
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn sản phẩm thành công.',
        ]);
    }
}