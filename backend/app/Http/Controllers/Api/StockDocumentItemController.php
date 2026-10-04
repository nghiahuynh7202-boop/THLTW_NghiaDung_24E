<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockDocumentItemRequest;
use App\Http\Resources\StockDocumentItemResource;
use App\Models\Product;
use App\Models\StockDocument;
use App\Models\StockDocumentItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class StockDocumentItemController extends Controller
{
    /**
     * GET /api/admin/stock-document-items — Danh sách chi tiết phiếu kho
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = StockDocumentItem::with(['product', 'document'])->latest('id');

        $perPage = (int) $request->input('per_page', 20);
        $items = $query->paginate($perPage);

        return StockDocumentItemResource::collection($items);
    }

    /**
     * POST /api/admin/stock-document-items — Thêm chi tiết phiếu kho
     */
    public function store(StockDocumentItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['unit_cost'] = $data['unit_cost'] ?? 0;

        $item = DB::transaction(function () use ($data) {
            $docItem = StockDocumentItem::create($data);
            $document = StockDocument::find($data['document_id']);

            if ($document) {
                $product = Product::find($data['product_id']);
                if ($product) {
                    if ($document->type === 'in') {
                        $product->increment('qty', $data['qty']);
                    } elseif ($document->type === 'out') {
                        $product->decrement('qty', $data['qty']);
                    }
                }
            }

            return $docItem;
        });

        return (new StockDocumentItemResource($item->load('product')))
            ->additional(['message' => 'Thêm chi tiết phiếu kho thành công.'])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/admin/stock-document-items/{id} — Chi tiết dòng phiếu kho
     */
    public function show($id): StockDocumentItemResource
    {
        $item = StockDocumentItem::with(['product', 'document'])->findOrFail($id);

        return new StockDocumentItemResource($item);
    }

    /**
     * PUT|PATCH /api/admin/stock-document-items/{item} — Cập nhật chi tiết phiếu kho
     */
    public function update(StockDocumentItemRequest $request, StockDocumentItem $stockDocumentItem): JsonResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($stockDocumentItem, $data) {
            $oldQty = $stockDocumentItem->qty;
            $document = $stockDocumentItem->document;
            $newQty = $data['qty'] ?? $oldQty;

            $stockDocumentItem->update($data);

            if ($document && isset($data['qty']) && $newQty != $oldQty) {
                $diff = $newQty - $oldQty;
                $product = Product::find($stockDocumentItem->product_id);
                if ($product) {
                    if ($document->type === 'in') {
                        $product->increment('qty', $diff);
                    } elseif ($document->type === 'out') {
                        $product->decrement('qty', $diff);
                    }
                }
            }
        });

        return (new StockDocumentItemResource($stockDocumentItem->load('product')))
            ->additional(['message' => 'Cập nhật chi tiết phiếu kho thành công.'])
            ->response();
    }

    /**
     * DELETE /api/admin/stock-document-items/{item} — Xóa chi tiết phiếu kho
     */
    public function destroy(StockDocumentItem $stockDocumentItem): JsonResponse
    {
        DB::transaction(function () use ($stockDocumentItem) {
            $document = $stockDocumentItem->document;
            $product = Product::find($stockDocumentItem->product_id);

            if ($document && $product) {
                if ($document->type === 'in') {
                    $product->decrement('qty', $stockDocumentItem->qty);
                } elseif ($document->type === 'out') {
                    $product->increment('qty', $stockDocumentItem->qty);
                }
            }

            $stockDocumentItem->delete();
        });

        return response()->json([
            'message' => 'Xóa chi tiết phiếu kho thành công.',
        ]);
    }
}
