<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Lấy danh sách sản phẩm phân trang
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'sales'])->latest('id');

        // Khách chỉ xem sản phẩm đang bật
        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        // Lọc theo danh mục
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Lọc sản phẩm nổi bật
        if ($request->filled('is_featured')) {
            $query->where('is_featured', (int) $request->input('is_featured'));
        }

        $perPage = (int) $request->input('per_page', 12);
        return ProductResource::collection($query->paginate($perPage));
    }

    // Thêm sản phẩm mới
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

        // Lưu giá khuyến mãi nếu có nhập
        if ($salePrice !== null && (float) $salePrice > 0) {
            ProductSale::create([
                'name'       => 'Khuyến mãi ' . $product->name,
                'product_id' => $product->id,
                'pricesale'  => (int) $salePrice,
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

    // Xem chi tiết một sản phẩm theo ID hoặc Slug
    public function show($id): ProductResource
    {
        $product = Product::with(['category', 'brand', 'sales'])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return new ProductResource($product);
    }

    // Cập nhật sản phẩm
    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('slug', $data) && empty($data['slug'])) {
            $data['slug'] = Product::uniqueSlug($data['name'] ?? $product->name, $product->id);
        }

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        } else {
            unset($data['image']);
        }

        $hasSale = $request->input('is_on_sale') !== '0' && $request->input('is_on_sale') !== 0;
        $salePrice = $data['sale_price'] ?? $request->input('sale_price');
        unset($data['sale_price'], $data['is_on_sale']);

        $product->update($data);

        // Cập nhật hoặc xóa giá khuyến mãi
        if ($hasSale && $salePrice !== null && $salePrice !== '' && (float) $salePrice > 0) {
            ProductSale::updateOrCreate(
                ['product_id' => $product->id, 'apply_to' => 'product'],
                [
                    'name'       => 'Khuyến mãi ' . $product->name,
                    'pricesale'  => (int) $salePrice,
                    'date_begin' => now(),
                    'date_end'   => now()->addYears(1),
                    'status'     => 1,
                ]
            );
        } else {
            ProductSale::where('product_id', $product->id)
                ->where('apply_to', 'product')
                ->delete();
        }

        return (new ProductResource($product->load(['category', 'brand', 'sales'])))
            ->additional(['message' => 'Cập nhật sản phẩm thành công.'])
            ->response();
    }

    // Xóa tạm vào thùng rác
    public function destroy(Product $product): JsonResponse
    {
        $product->update(['status' => 0]);
        $product->delete();

        return response()->json([
            'message' => 'Xóa tạm sản phẩm thành công.',
        ]);
    }

    // Danh sách thùng rác
    public function trash(Request $request)
    {
        $perPage = (int) $request->input('per_page', 12);
        $products = Product::onlyTrashed()
            ->with(['category', 'brand', 'sales'])
            ->latest('deleted_at')
            ->paginate($perPage);

        return ProductResource::collection($products);
    }

    // Khôi phục từ thùng rác
    public function restore(int|string $id): JsonResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->update(['status' => 1]);
        $product->restore();

        return (new ProductResource($product->load(['category', 'brand'])))
            ->additional(['message' => 'Khôi phục sản phẩm thành công.'])
            ->response();
    }

    // Xóa vĩnh viễn khỏi database
    public function forceDelete(int|string $id): JsonResponse
    {
        $product = Product::withTrashed()->findOrFail($id);

        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn sản phẩm thành công.',
        ]);
    }
}