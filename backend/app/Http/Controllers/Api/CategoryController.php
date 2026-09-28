<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // 1. LẤY DANH SÁCH DANH MỤC ĐANG HOẠT ĐỘNG (GET: /api/categories)
    public function index()
    {
        $categories = Category::active()
            ->whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->active()])
            ->orderBy('id', 'asc')
            ->get();

        return CategoryResource::collection($categories);
    }

    // 2. THÊM MỚI DANH MỤC (POST: /api/categories)
    public function store(Request $request)
    {
        $category = Category::create($request->all());

        return new CategoryResource($category);
    }

    // 3. XEM CHI TIẾT 1 DANH MỤC (GET: /api/categories/{id})
    public function show($id)
    {
        $category = Category::with('children')->findOrFail($id);

        return new CategoryResource($category);
    }

    // 4. SỬA DANH MỤC (PUT/PATCH: /api/categories/{id})
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update($request->all());

        return new CategoryResource($category);
    }

    // 5. XÓA TẠM (VÀO THÙNG RÁC - STATUS = 0) (DELETE: /api/categories/{id})
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->status = 0; // Đổi status = 0 (xóa tạm)
        $category->save();

        return response()->json(['message' => 'Đã chuyển danh mục vào thùng rác (xóa tạm thành công)!']);
    }

    // 6. XEM DANH SÁCH THÙNG RÁC (GET: /api/categories/trash)
    public function trash()
    {
        $categories = Category::trash()->get(); // Lấy các danh mục có status = 0

        return CategoryResource::collection($categories);
    }

    // 7. KHÔI PHỤC TỪ THÙNG RÁC (POST: /api/categories/{id}/restore)
    public function restore($id)
    {
        $category = Category::findOrFail($id);
        $category->status = 1; // Khôi phục hoạt động (status = 1)
        $category->save();

        return new CategoryResource($category);
    }

    // 8. XÓA VĨNH VIỄN KHỎI CSDL (DELETE: /api/categories/{id}/force-delete)
    public function forceDelete($id)
    {
        $category = Category::findOrFail($id);
        $category->delete(); // Xóa hoàn toàn bản ghi khỏi database

        return response()->json(['message' => 'Đã xóa vĩnh viễn danh mục thành công!']);
    }
}
