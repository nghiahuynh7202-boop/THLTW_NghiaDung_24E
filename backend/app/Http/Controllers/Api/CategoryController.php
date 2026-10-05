<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * GET /api/categories hoặc GET /api/admin/categories — Danh sách danh mục
     */
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
    public function store(Request $request): JsonResponse
    {
        $table = (new Category)->getTable();

        $data = $request->validate([
            'parent_id'   => 'nullable|integer',
            'name'        => 'required|string|max:150',
            'slug'        => "nullable|string|max:150|unique:{$table},slug",
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_featured' => 'nullable',
            'status'      => 'nullable|integer|in:0,1',
        ]);

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
    public function update(Request $request, Category $category): JsonResponse
    {
        $table = $category->getTable();

        $data = $request->validate([
            'parent_id'   => 'nullable|integer',
            'name'        => 'sometimes|required|string|max:150',
            'slug'        => "nullable|string|max:150|unique:{$table},slug,{$category->id}",
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_featured' => 'nullable',
            'status'      => 'nullable|integer|in:0,1',
        ]);

        if (isset($data['parent_id']) && (int)$data['parent_id'] === 0) {
            $data['parent_id'] = null;
        }

        if (isset($data['is_featured'])) {
            $data['is_featured'] = filter_var($data['is_featured'], FILTER_VALIDATE_BOOLEAN);
        }

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        } else {
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
    public function destroy(Category $category): JsonResponse
    {
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
