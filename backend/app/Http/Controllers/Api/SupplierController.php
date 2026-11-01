<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SupplierController extends Controller
{
    /**
     * GET /api/admin/suppliers — Danh sách nhà cung cấp
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Supplier::latest('id');

        if (! $request->is('api/admin/*')) {
            $query->active();
        }

        if ($request->filled('keyword')) {
            $keyword = trim($request->input('keyword'));
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('phone', 'like', "%{$keyword}%")
                  ->orWhere('address', 'like', "%{$keyword}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', (int) $request->input('status'));
        }

        $perPage = (int) $request->input('per_page', 12);
        $suppliers = $query->paginate($perPage);

        return SupplierResource::collection($suppliers);
    }

    /**
     * POST /api/admin/suppliers — Thêm nhà cung cấp
     */
    public function store(SupplierRequest $request): JsonResponse
    {
        $data = $request->validated();
        $supplier = Supplier::create($data);

        return (new SupplierResource($supplier))
            ->additional(['message' => 'Thêm nhà cung cấp thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/suppliers/{id} — Chi tiết nhà cung cấp
     */
    public function show($id): SupplierResource
    {
        $supplier = Supplier::findOrFail($id);

        return new SupplierResource($supplier);
    }

    /**
     * PUT|PATCH /api/admin/suppliers/{id} — Cập nhật nhà cung cấp
     */
    public function update(SupplierRequest $request, $supplier): JsonResponse
    {
        $model = $supplier instanceof Supplier ? $supplier : Supplier::findOrFail($supplier);
        $data = $request->validated();
        $model->update($data);

        return (new SupplierResource($model))
            ->additional(['message' => 'Cập nhật nhà cung cấp thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/suppliers/{id} — Xóa tạm nhà cung cấp (vào thùng rác)
     */
    public function destroy($supplier): JsonResponse
    {
        $model = $supplier instanceof Supplier ? $supplier : Supplier::findOrFail($supplier);
        $model->delete();

        return response()->json([
            'message' => 'Xóa tạm nhà cung cấp thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/suppliers/trash — Danh sách nhà cung cấp trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $query = Supplier::onlyTrashed()->latest('deleted_at');

        if ($request->filled('keyword')) {
            $keyword = trim($request->input('keyword'));
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('phone', 'like', "%{$keyword}%")
                  ->orWhere('address', 'like', "%{$keyword}%");
            });
        }

        $perPage = (int) $request->input('per_page', 12);
        $suppliers = $query->paginate($perPage);

        return SupplierResource::collection($suppliers);
    }

    /**
     * PATCH /api/admin/suppliers/{id}/restore — Khôi phục nhà cung cấp từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $supplier = Supplier::onlyTrashed()->findOrFail($id);
        $supplier->restore();
        $supplier->update(['status' => 1]);

        return (new SupplierResource($supplier))
            ->additional(['message' => 'Khôi phục nhà cung cấp thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/suppliers/{id}/force — Xóa vĩnh viễn nhà cung cấp
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $supplier = Supplier::withTrashed()->findOrFail($id);
        $supplier->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn nhà cung cấp thành công.',
        ]);
    }
}
