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
    $query = Product::with(['category', 'brand'])->latest('id');

    
    if (! $request->is('api/admin/*')) {
        $query->active();
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

        $product = Product::create($data);

        return (new ProductResource($product->load(['category', 'brand'])))
            ->additional(['message' => 'Thêm sản phẩm thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/products/{product} hoặc GET /api/products/{product} — Chi tiết sản phẩm
     */
        public function show($id): ProductResource
    {
        $product = Product::with(['category', 'brand'])->findOrFail($id);

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

        $product->update($data);

        return (new ProductResource($product->load(['category', 'brand'])))
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
        ->with(['category', 'brand'])
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