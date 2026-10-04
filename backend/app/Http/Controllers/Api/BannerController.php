<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    /**
     * GET /api/banners hoặc GET /api/admin/banners — Danh sách banner
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Banner::orderBy('order_num', 'asc')->latest('id');

        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        $perPage = (int) $request->input('per_page', 12);
        $banners = $query->paginate($perPage);

        return BannerResource::collection($banners);
    }

    /**
     * POST /api/admin/banners — Thêm banner mới
     */
    public function store(BannerRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('banners', 'public');
        }

        $banner = Banner::create($data);

        return (new BannerResource($banner))
            ->additional(['message' => 'Thêm banner thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/banners/{id} hoặc GET /api/banners/{id} — Chi tiết banner
     */
    public function show($id): BannerResource
    {
        $banner = Banner::findOrFail($id);

        return new BannerResource($banner);
    }

    /**
     * PUT|PATCH /api/admin/banners/{banner} — Cập nhật banner
     */
    public function update(BannerRequest $request, Banner $banner): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($banner->image) {
                Storage::disk('public')->delete($banner->image);
            }
            $data['image'] = $request->file('image')->store('banners', 'public');
        } else {
            unset($data['image']);
        }

        $banner->update($data);

        return (new BannerResource($banner))
            ->additional(['message' => 'Cập nhật banner thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/banners/{banner} — Xóa tạm banner (vào thùng rác)
     */
    public function destroy(Banner $banner): JsonResponse
    {
        $banner->update(['status' => 0]);
        $banner->delete();

        return response()->json([
            'message' => 'Xóa tạm banner thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/banners/trash — Danh sách banner trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);
        $banners = Banner::onlyTrashed()
            ->latest('deleted_at')
            ->paginate($perPage);

        return BannerResource::collection($banners);
    }

    /**
     * PATCH /api/admin/banners/{id}/restore — Khôi phục banner từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $banner = Banner::onlyTrashed()->findOrFail($id);
        $banner->restore();

        return (new BannerResource($banner))
            ->additional(['message' => 'Khôi phục banner thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/banners/{id}/force — Xóa vĩnh viễn banner
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $banner = Banner::withTrashed()->findOrFail($id);

        if ($banner->image) {
            Storage::disk('public')->delete($banner->image);
        }

        $banner->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn banner thành công.',
        ]);
    }
}
