<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * File này làm gì: Quản lý Danh mục sản phẩm (Category) theo cấu trúc cây cha - con.
 * Phục vụ menu danh mục ở trang chủ và toàn bộ tác vụ CRUD danh mục trong trang quản trị.
 */
class CategoryController extends Controller
{
    // Lấy danh sách danh mục: khách chỉ nhận danh mục gốc đang hiển thị, admin lấy toàn bộ cây danh mục
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Category::with('children')->latest('id');

        if (! $request->is('api/admin/*')) {
            $query->active()->whereNull('parent_id');
        }

        $perPage = (int) $request->input('per_page', 50);
        $categories = $query->paginate($perPage);

        return CategoryResource::collection($categories);
    }

    /**
     * POST /api/admin/categories — Thêm danh mục
     */
    public function store(CategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['slug']) && !empty($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if (isset($data['parent_id']) && (int)$data['parent_id'] === 0) {
            $data['parent_id'] = null;
        }

        $data['is_featured'] = !empty($data['is_featured']) && filter_var($data['is_featured'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $data['status'] = isset($data['status']) ? (int)$data['status'] : 1;

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        } else {
            $data['image'] = null;
        }

        $category = Category::create($data);

        return (new CategoryResource($category))
            ->additional(['message' => 'Thêm danh mục thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/categories/{category} hoặc GET /api/categories/{category} — Chi tiết danh mục
     */
    public function show($id): CategoryResource
    {
        $category = Category::with(['parent', 'children'])->findOrFail($id);

        return new CategoryResource($category);
    }

    /**
     * PUT|PATCH /api/admin/categories/{category} — Cập nhật danh mục
     */
    public function update(CategoryRequest $request, $id): JsonResponse
    {
        $category = $id instanceof Category ? $id : Category::findOrFail($id);
        $data = $request->validated();

        if (empty($data['slug']) && !empty($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if (isset($data['parent_id']) && (int)$data['parent_id'] === 0) {
            $data['parent_id'] = null;
        }

        if (isset($data['is_featured'])) {
            $data['is_featured'] = filter_var($data['is_featured'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }

        if (isset($data['status'])) {
            $data['status'] = (int)$data['status'];
        }

        // Xử lý ảnh: nếu có upload ảnh mới thì xóa ảnh cũ và lưu ảnh mới
        if ($request->hasFile('image')) {
            if ($category->image && Storage::disk('public')->exists($category->image)) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        } else {
            // Không gửi ảnh mới thì giữ nguyên ảnh cũ
            unset($data['image']);
        }

        $category->update($data);

        return (new CategoryResource($category))
            ->additional(['message' => 'Cập nhật danh mục thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/categories/{category} — Xóa tạm danh mục (vào thùng rác)
     */
    public function destroy($id): JsonResponse
    {
        $category = $id instanceof Category ? $id : Category::findOrFail($id);
        $category->update(['status' => 0]);

        return response()->json([
            'message' => 'Xóa tạm danh mục thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/categories/trash — Danh sách danh mục trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', $request->input('pageSize', 10));
        $categories = Category::where('status', 0)->latest('id')->paginate($perPage);

        return CategoryResource::collection($categories);
    }

    /**
     * PATCH /api/admin/categories/{id}/restore — Khôi phục danh mục từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $category = Category::findOrFail($id);
        $category->update(['status' => 1]);

        return (new CategoryResource($category))
            ->additional(['message' => 'Khôi phục danh mục thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/categories/{id}/force — Xóa vĩnh viễn danh mục
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn danh mục thành công.',
        ]);
    }
}
