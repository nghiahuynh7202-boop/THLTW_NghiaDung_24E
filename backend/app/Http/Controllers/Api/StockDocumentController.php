<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockDocumentRequest;
use App\Http\Resources\StockDocumentResource;
use App\Models\Product;
use App\Models\StockDocument;
use App\Models\StockDocumentItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class StockDocumentController extends Controller
{
    /**
     * GET /api/admin/stock-documents — Danh sách phiếu xuất/nhập kho
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = StockDocument::with(['supplier', 'creator', 'items.product'])->latest('id');

        if ($request->filled('type') && in_array($request->input('type'), ['in', 'out'])) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('keyword')) {
            $kw = trim((string) $request->input('keyword'));
            $query->where(function ($q) use ($kw) {
                $q->where('code', 'LIKE', "%{$kw}%")
                  ->orWhere('reason', 'LIKE', "%{$kw}%")
                  ->orWhere('note', 'LIKE', "%{$kw}%");
            });
        }

        $perPage = (int) $request->input('per_page', 12);
        $documents = $query->paginate($perPage);

        return StockDocumentResource::collection($documents);
    }

    /**
     * POST /api/admin/stock-documents — Thêm phiếu xuất/nhập kho
     */
    public function store(StockDocumentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $items = $data['items'] ?? [];
        unset($data['items']);

        $data['code'] = $data['code'] ?? StockDocument::generateUniqueCode($data['type']);
        if ($request->user() && empty($data['created_by'])) {
            $data['created_by'] = $request->user()->id;
        }

        try {
            $document = DB::transaction(function () use ($data, $items) {
                $doc = StockDocument::create($data);

                if (! empty($items)) {
                    foreach ($items as $itemData) {
                        $itemData['document_id'] = $doc->id;
                        $itemData['unit_cost'] = $itemData['unit_cost'] ?? 0;
                        StockDocumentItem::create($itemData);

                        $product = Product::lockForUpdate()->find($itemData['product_id']);
                        if (! $product) {
                            throw new \Exception("Sản phẩm ID #{$itemData['product_id']} không tồn tại.");
                        }

                        if ($doc->type === 'in') {
                            $product->increment('qty', (int) $itemData['qty']);
                        } elseif ($doc->type === 'out') {
                            if ($product->qty < (int) $itemData['qty']) {
                                throw new \Exception("Sản phẩm '{$product->name}' không đủ số lượng tồn kho để xuất (Hiện còn: {$product->qty}, yêu cầu xuất: {$itemData['qty']}).");
                            }
                            $product->decrement('qty', (int) $itemData['qty']);
                        }
                    }
                }

                return $doc;
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'Có lỗi xảy ra khi tạo phiếu kho.',
            ], 422);
        }

        return (new StockDocumentResource($document->load(['supplier', 'creator', 'items.product'])))
            ->additional(['message' => 'Thêm phiếu kho thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/stock-documents/{id} — Chi tiết phiếu xuất/nhập kho
     */
    public function show($id): StockDocumentResource
    {
        $document = StockDocument::with(['supplier', 'creator', 'items.product'])->findOrFail($id);

        return new StockDocumentResource($document);
    }

    /**
     * PUT|PATCH /api/admin/stock-documents/{id} — Cập nhật phiếu xuất/nhập kho
     */
    public function update(StockDocumentRequest $request, $id): JsonResponse
    {
        $stockDocument = $id instanceof StockDocument ? $id : StockDocument::findOrFail($id);
        $data = $request->validated();
        unset($data['items']);

        $stockDocument->update($data);

        return (new StockDocumentResource($stockDocument->load(['supplier', 'creator', 'items.product'])))
            ->additional(['message' => 'Cập nhật phiếu kho thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/stock-documents/{id} — Xóa tạm phiếu xuất/nhập kho (vào thùng rác)
     */
    public function destroy($id): JsonResponse
    {
        $stockDocument = $id instanceof StockDocument ? $id : StockDocument::findOrFail($id);
        $stockDocument->delete();

        return response()->json([
            'message' => 'Xóa tạm phiếu kho thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/stock-documents/trash — Danh sách phiếu xuất/nhập kho trong thùng rác
     */
    public function trash(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->input('per_page', 12);
        $documents = StockDocument::onlyTrashed()
            ->with(['supplier', 'creator', 'items.product'])
            ->latest('deleted_at')
            ->paginate($perPage);

        return StockDocumentResource::collection($documents);
    }

    /**
     * PATCH /api/admin/stock-documents/{id}/restore — Khôi phục phiếu xuất/nhập kho từ thùng rác
     */
    public function restore(int|string $id): JsonResponse
    {
        $document = StockDocument::onlyTrashed()->findOrFail($id);
        $document->restore();

        return (new StockDocumentResource($document->load(['supplier', 'creator', 'items.product'])))
            ->additional(['message' => 'Khôi phục phiếu kho thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/stock-documents/{id}/force — Xóa vĩnh viễn phiếu xuất/nhập kho
     */
    public function forceDelete(int|string $id): JsonResponse
    {
        $document = StockDocument::withTrashed()->findOrFail($id);
        $document->items()->delete();
        $document->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn phiếu kho thành công.',
        ]);
    }
}
