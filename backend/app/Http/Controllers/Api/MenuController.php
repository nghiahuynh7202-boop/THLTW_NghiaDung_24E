<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MenuRequest;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MenuController extends Controller
{
    /**
     * GET /api/menus hoặc GET /api/admin/menus — Danh sách menu
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Menu::orderBy('order_num', 'asc')->latest('id');

        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        $perPage = (int) $request->input('per_page', 12);
        $menus = $query->paginate($perPage);

        return MenuResource::collection($menus);
    }

    /**
     * POST /api/admin/menus — Thêm menu
     */
    public function store(MenuRequest $request): JsonResponse
    {
        $data = $request->validated();
        $menu = Menu::create($data);

        return (new MenuResource($menu))
            ->additional(['message' => 'Thêm menu thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/menus/{id} hoặc GET /api/menus/{id} — Chi tiết menu
     */
    public function show($id): MenuResource
    {
        $menu = Menu::findOrFail($id);

        return new MenuResource($menu);
    }

    /**
     * PUT|PATCH /api/admin/menus/{menu} — Cập nhật menu
     */
    public function update(MenuRequest $request, Menu $menu): JsonResponse
    {
        $data = $request->validated();
        $menu->update($data);

        return (new MenuResource($menu))
            ->additional(['message' => 'Cập nhật menu thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/menus/{menu} — Xóa tạm menu (vào thùng rác)
     */
    public function destroy($id): JsonResponse
    {
        $menu = $id instanceof Menu ? $id : Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'message' => 'Xóa tạm menu thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/menus/trash — Danh sách menu trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);
        $menus = Menu::onlyTrashed()
            ->latest('deleted_at')
            ->paginate($perPage);

        return MenuResource::collection($menus);
    }

    /**
     * PATCH /api/admin/menus/{id}/restore — Khôi phục menu từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $menu = Menu::onlyTrashed()->findOrFail($id);
        $menu->restore();
        $menu->update(['status' => 1]);

        return (new MenuResource($menu))
            ->additional(['message' => 'Khôi phục menu thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/menus/{id}/force — Xóa vĩnh viễn menu
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $menu = Menu::withTrashed()->findOrFail($id);
        $menu->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn menu thành công.',
        ]);
    }
}
