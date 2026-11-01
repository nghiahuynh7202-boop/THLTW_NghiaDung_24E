<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PageController extends Controller
{
    /**
     * GET /api/pages hoặc GET /api/admin/pages — Danh sách trang đơn
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Page::latest('id');

        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        $perPage = (int) $request->input('per_page', 12);
        $pages = $query->paginate($perPage);

        return PageResource::collection($pages);
    }

    /**
     * POST /api/admin/pages — Thêm trang đơn
     */
    public function store(PageRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Page::uniqueSlug($data['title']);

        $page = Page::create($data);

        return (new PageResource($page))
            ->additional(['message' => 'Thêm trang đơn thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/pages/{id} hoặc GET /api/pages/{id} — Chi tiết trang đơn
     */
    public function show($id): PageResource
    {
        $page = Page::where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return new PageResource($page);
    }

    /**
     * PUT|PATCH /api/admin/pages/{page} — Cập nhật trang đơn
     */
    public function update(PageRequest $request, $id): JsonResponse
    {
        $page = $id instanceof Page ? $id : Page::findOrFail($id);
        $data = $request->validated();

        if (array_key_exists('slug', $data) && empty($data['slug'])) {
            $data['slug'] = Page::uniqueSlug($data['title'] ?? $page->title, $page->id);
        }

        $page->update($data);

        return (new PageResource($page))
            ->additional(['message' => 'Cập nhật trang đơn thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/pages/{page} — Xóa tạm trang đơn (vào thùng rác)
     */
    public function destroy($id): JsonResponse
    {
        $page = $id instanceof Page ? $id : Page::findOrFail($id);
        $page->delete();

        return response()->json([
            'message' => 'Xóa tạm trang đơn thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/pages/trash — Danh sách trang đơn trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);
        $pages = Page::onlyTrashed()
            ->latest('deleted_at')
            ->paginate($perPage);

        return PageResource::collection($pages);
    }

    /**
     * PATCH /api/admin/pages/{id}/restore — Khôi phục trang đơn từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $page = Page::onlyTrashed()->findOrFail($id);
        $page->restore();
        $page->update(['status' => 1]);

        return (new PageResource($page))
            ->additional(['message' => 'Khôi phục trang đơn thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/pages/{id}/force — Xóa vĩnh viễn trang đơn
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $page = Page::withTrashed()->findOrFail($id);
        $page->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn trang đơn thành công.',
        ]);
    }
}
