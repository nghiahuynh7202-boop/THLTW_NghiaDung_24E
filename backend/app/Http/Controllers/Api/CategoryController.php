<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

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

        $perPage = (int) $request->input('per_page', 12);
        $categories = $query->paginate($perPage);

        return CategoryResource::collection($categories);
    }

    /**
     * POST /api/admin/categories — Thêm danh mục
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'parent_id'   => 'nullable|integer|exists:categories,id',
            'name'        => 'required|string|max:150',
            'slug'        => 'nullable|string|max:150|unique:categories,slug',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_featured' => 'nullable|boolean',
            'status'      => 'nullable|integer|in:0,1',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
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
        $data = $request->validate([
            'parent_id'   => 'nullable|integer|exists:categories,id',
            'name'        => 'sometimes|required|string|max:150',
            'slug'        => 'nullable|string|max:150|unique:categories,slug,' . $category->id,
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_featured' => 'nullable|boolean',
            'status'      => 'nullable|integer|in:0,1',
        ]);

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
        $category->delete();

        return response()->json([
            'message' => 'Xóa tạm danh mục thành công (đã chuyển vào thùng rác).',
        ]);
    }
}
