<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Các route cho Thùng rác, Khôi phục và Xóa vĩnh viễn danh mục (đặt trước apiResource)
Route::prefix('categories')->group(function () {
    Route::get('/trash', [CategoryController::class, 'trash']);                      // Danh sách thùng rác (đã xóa tạm)
    Route::post('/{id}/restore', [CategoryController::class, 'restore']);            // Khôi phục danh mục
    Route::delete('/{id}/force-delete', [CategoryController::class, 'forceDelete']); // Xóa vĩnh viễn khỏi CSDL
});

// Resource CRUD chuẩn:
// GET    /api/categories        -> index   (lấy danh sách)
// POST   /api/categories        -> store   (thêm mới)
// GET    /api/categories/{id}   -> show    (xem chi tiết)
// PUT    /api/categories/{id}   -> update  (sửa danh mục)
// DELETE /api/categories/{id}   -> destroy (xóa tạm)
Route::apiResource('categories', CategoryController::class);
