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

        if ($request->filled('type')) {
            $query->where('type', $request->query('type'));
        }

        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->query('supplier_id'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'LIKE', "%{$search}%")
                  ->orWhere('reason', 'LIKE', "%{$search}%")
                  ->orWhere('note', 'LIKE', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 12);
        $documents = $query->paginate($perPage);

        return StockDocumentResource::collection($documents);
    }

    /**
     * POST /api/admin/stock-documents — Tạo phiếu xuất/nhập kho (hỗ trợ kèm danh sách sản phẩm)
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

        $document = DB::transaction(function () use ($data, $items) {
            $doc = StockDocument::create($data);

            if (! empty($items)) {
                foreach ($items as $itemData) {
                    $itemData['document_id'] = $doc->id;
                    $itemData['unit_cost'] = $itemData['unit_cost'] ?? 0;
                    StockDocumentItem::create($itemData);

                    // Cập nhật số lượng tồn kho của sản phẩm
                    $product = Product::find($itemData['product_id']);
                    if ($product) {
                        if ($doc->type === 'in') {
                            $product->increment('qty', $itemData['qty']);
                        } elseif ($doc->type === 'out') {
                            $product->decrement('qty', $itemData['qty']);
                        }
                    }
                }
            }

            return $doc;
        });

        return (new StockDocumentResource($document->load(['supplier', 'creator', 'items.product'])))
            ->additional(['message' => 'Tạo phiếu kho thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/stock-documents/{id} — Chi tiết phiếu kho
     */
    public function show($id): StockDocumentResource
    {
        $document = StockDocument::with(['supplier', 'creator', 'items.product'])
            ->where('id', $id)
            ->orWhere('code', $id)
            ->firstOrFail();

        return new StockDocumentResource($document);
    }

    /**
     * PUT|PATCH /api/admin/stock-documents/{stock_document} — Cập nhật thông tin phiếu kho
     */
    public function update(StockDocumentRequest $request, StockDocument $stockDocument): JsonResponse
    {
        $data = $request->validated();
        unset($data['items']);

        $stockDocument->update($data);

        return (new StockDocumentResource($stockDocument->load(['supplier', 'creator', 'items.product'])))
            ->additional(['message' => 'Cập nhật phiếu kho thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/stock-documents/{stock_document} — Xóa tạm phiếu kho
     */
    public function destroy(StockDocument $stockDocument): JsonResponse
    {
        $stockDocument->delete();

        return response()->json([
            'message' => 'Xóa tạm phiếu kho thành công (đã chuyển vào thùng rác).',
        ]);
    }

    /**
     * GET /api/admin/stock-documents/trash — Danh sách phiếu kho trong thùng rác
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
     * PATCH /api/admin/stock-documents/{id}/restore — Khôi phục phiếu kho từ thùng rác
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
     * DELETE /api/admin/stock-documents/{id}/force — Xóa vĩnh viễn phiếu kho
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
