<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class BrandController extends Controller
{

    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Brand::latest('id');

   
        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        $perPage = (int) $request->input('per_page', 12);
        $brands = $query->paginate($perPage);

        return BrandResource::collection($brands);
    }

    /**
     * POST /api/admin/brands — Thêm thương hiệu
     */
    public function store(BrandRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Brand::uniqueSlug($data['name']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('brands', 'public');
        }

        $brand = Brand::create($data);

        return (new BrandResource($brand))
            ->additional(['message' => 'Thêm thương hiệu thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/brands/{brand} hoặc GET /api/brands/{brand} — Chi tiết thương hiệu
     */
    public function show($id): BrandResource
    {
        $brand = is_numeric($id)
            ? Brand::findOrFail($id)
            : Brand::where('slug', $id)->firstOrFail();

        return new BrandResource($brand);
    }

    /**
     * PUT|PATCH /api/admin/brands/{brand} — Cập nhật thương hiệu
     */
    public function update(BrandRequest $request, Brand $brand): JsonResponse
    {
        $data = $request->validated();

        // Không gửi slug thì giữ nguyên slug cũ, gửi slug rỗng thì tạo lại từ tên
        if (array_key_exists('slug', $data) && empty($data['slug'])) {
            $data['slug'] = Brand::uniqueSlug($data['name'] ?? $brand->name, $brand->id);
        }

        if ($request->hasFile('image')) {
            // Xóa ảnh cũ để không rác storage
            if ($brand->image) {
                Storage::disk('public')->delete($brand->image);
            }
            $data['image'] = $request->file('image')->store('brands', 'public');
        } else {
            unset($data['image']); // Không gửi ảnh mới thì giữ nguyên ảnh cũ
        }

        $brand->update($data);

        return (new BrandResource($brand))
            ->additional(['message' => 'Cập nhật thương hiệu thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/brands/{brand} — Xóa tạm thương hiệu (vào thùng rác)
     */
public function destroy(Brand $brand): JsonResponse
{
    $brand->update(['status' => 0]);
    $brand->delete();                  

    return response()->json([
        'message' => 'Xóa tạm thương hiệu thành công (đã chuyển vào thùng rác).',
    ]);
}

    /**
     * GET /api/admin/brands/trash — Danh sách thương hiệu trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);
        $brands = Brand::onlyTrashed()
            ->latest('deleted_at')
            ->paginate($perPage);

        return BrandResource::collection($brands);
    }

    /**
     * PATCH /api/admin/brands/{id}/restore — Khôi phục thương hiệu từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $brand = Brand::onlyTrashed()->findOrFail($id);
        $brand->update(['status' => 1]);
        $brand->restore();

        return (new BrandResource($brand))
            ->additional(['message' => 'Khôi phục thương hiệu thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/brands/{id}/force — Xóa vĩnh viễn thương hiệu
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $brand = Brand::withTrashed()->findOrFail($id);

       
        if ($brand->image) {
            Storage::disk('public')->delete($brand->image);
        }

        $brand->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn thương hiệu thành công.',
        ]);
    }
}
