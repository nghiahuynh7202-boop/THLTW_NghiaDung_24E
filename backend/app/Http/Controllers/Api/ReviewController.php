<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * 1. CLIENT: Lấy danh sách đánh giá công khai & thống kê sao của sản phẩm
     * GET /api/products/{productId}/reviews
     */
    public function getProductReviews(Request $request, $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        // Lấy tất cả đánh giá đang hiển thị công khai (status = 1)
        $activeQuery = Review::where('product_id', $productId)->active();

        // 1. Thống kê điểm trung bình & tổng số lượt
        $totalReviews = (clone $activeQuery)->count();
        $avgRating = $totalReviews > 0
            ? round((float) (clone $activeQuery)->avg('rating'), 1)
            : 5.0;

        // 2. Thống kê phân bổ theo số sao (5, 4, 3, 2, 1)
        $breakdown = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        $starCounts = (clone $activeQuery)
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        foreach ($breakdown as $star => $count) {
            $breakdown[$star] = (int) ($starCounts[$star] ?? 0);
        }

        // 3. Danh sách đánh giá phân trang kèm thông tin người gửi
        $perPage = (int) $request->input('per_page', 5);
        $reviews = $activeQuery
            ->with(['user' => fn($q) => $q->select('id', 'name')])
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'avg_rating'       => $avgRating,
            'total_reviews'    => $totalReviews,
            'rating_breakdown' => $breakdown,
            'reviews'          => $reviews,
        ]);
    }

    /**
     * 2. CLIENT: Gửi đánh giá mới cho sản phẩm (yêu cầu đăng nhập)
     * POST /api/products/{productId}/reviews
     */
    public function storeProductReview(Request $request, $productId): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'message' => 'Vui lòng đăng nhập để gửi đánh giá sản phẩm!',
            ], 401);
        }

        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ], [
            'rating.required'  => 'Vui lòng chọn số sao đánh giá.',
            'rating.min'       => 'Số sao tối thiểu là 1 sao.',
            'rating.max'       => 'Số sao tối đa là 5 sao.',
            'comment.required' => 'Vui lòng nhập nội dung nhận xét của bạn.',
            'comment.max'      => 'Nội dung nhận xét không được vượt quá 1000 ký tự.',
        ]);

        $review = Review::create([
            'product_id' => $product->id,
            'user_id'    => $user->id,
            'rating'     => (int) $validated['rating'],
            'comment'    => trim($validated['comment']),
            'status'     => 1, // Mặc định hiển thị công khai
        ]);

        $review->load(['user:id,name']);

        return response()->json([
            'message' => 'Gửi đánh giá thành công! Cảm ơn bạn đã nhận xét sản phẩm.',
            'data'    => $review,
        ], 201);
    }

    /**
     * 3. ADMIN: Lấy danh sách tất cả đánh giá (tìm kiếm, lọc số sao, lọc trạng thái)
     * GET /api/admin/reviews
     */
    public function indexAdmin(Request $request): JsonResponse
    {
        $query = Review::with([
            'product:id,name,image,slug',
            'user:id,name,email',
        ])->latest('id');

        // Tìm kiếm theo từ khóa (tên sản phẩm, tên khách hàng hoặc nội dung nhận xét)
        if ($kw = trim($request->input('keyword', ''))) {
            $query->where(function ($q) use ($kw) {
                $q->where('comment', 'like', "%{$kw}%")
                  ->orWhereHas('product', fn($pq) => $pq->where('name', 'like', "%{$kw}%"))
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', "%{$kw}%")->orWhere('email', 'like', "%{$kw}%"));
            });
        }

        // Lọc theo số sao
        if ($request->filled('rating') && $request->input('rating') !== 'all') {
            $query->where('rating', (int) $request->input('rating'));
        }

        // Lọc theo trạng thái hiển thị
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', (int) $request->input('status'));
        }

        $perPage = (int) $request->input('per_page', 10);
        $reviews = $query->paginate($perPage);

        return response()->json($reviews);
    }

    /**
     * 4. ADMIN: Bật/Tắt trạng thái hiển thị đánh giá (1 <-> 0)
     * PATCH /api/admin/reviews/{id}/toggle
     */
    public function toggleStatus($id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->status = $review->status === 1 ? 0 : 1;
        $review->save();

        $statusText = $review->status === 1 ? 'Hiển thị' : 'Đã ẩn';

        return response()->json([
            'message' => "Đã chuyển trạng thái đánh giá sang: {$statusText}",
            'data'    => $review,
        ]);
    }

    /**
     * 5. ADMIN: Xóa vĩnh viễn một đánh giá
     * DELETE /api/admin/reviews/{id}
     */
    public function destroy($id): JsonResponse
    {
        $review = Review::findOrFail($id);
        $review->delete();

        return response()->json([
            'message' => 'Đã xóa đánh giá thành công.',
        ]);
    }
}
