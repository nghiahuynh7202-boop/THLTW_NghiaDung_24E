<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostTopicController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockDocumentController;
use App\Http\Controllers\Api\StockDocumentItemController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// =========================================================================
// 1. AUTHENTICATION & USER APIs (Đăng ký, Đăng nhập, Profile, Giỏ hàng)
// =========================================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'profile']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    // Giỏ hàng (Shopping Cart)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
});

// =========================================================================
// 2. CLIENT APIs (Dành cho trang người dùng / frontend bán hàng)
// =========================================================================
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{brand}', [BrandController::class, 'show']);

Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

Route::get('/banners', [BannerController::class, 'index']);
Route::get('/banners/{id}', [BannerController::class, 'show']);

Route::get('/menus', [MenuController::class, 'index']);
Route::get('/menus/{id}', [MenuController::class, 'show']);

Route::post('/contacts', [ContactController::class, 'store']);

Route::get('/post-topics', [PostTopicController::class, 'index']);
Route::get('/post-topics/{id}', [PostTopicController::class, 'show']);

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']);

Route::get('/pages', [PageController::class, 'index']);
Route::get('/pages/{id}', [PageController::class, 'show']);

// =========================================================================
// 3. ADMIN APIs (Dành cho trang quản trị hệ thống)
// =========================================================================
Route::prefix('admin')->group(function () {
    // 1. Sản phẩm (Products)
    Route::get('products/trash', [ProductController::class, 'trash']);
    Route::patch('products/{id}/restore', [ProductController::class, 'restore']);
    Route::delete('products/{id}/force', [ProductController::class, 'forceDelete']);
    Route::apiResource('products', ProductController::class);

    // 2. Thương hiệu (Brands)
    Route::get('brands/trash', [BrandController::class, 'trash']);
    Route::patch('brands/{id}/restore', [BrandController::class, 'restore']);
    Route::delete('brands/{id}/force', [BrandController::class, 'forceDelete']);
    Route::apiResource('brands', BrandController::class);

    // 3. Danh mục (Categories)
    Route::apiResource('categories', CategoryController::class);

    // 4. Banners
    Route::get('banners/trash', [BannerController::class, 'trash']);
    Route::patch('banners/{id}/restore', [BannerController::class, 'restore']);
    Route::delete('banners/{id}/force', [BannerController::class, 'forceDelete']);
    Route::apiResource('banners', BannerController::class);

    // 5. Menus
    Route::get('menus/trash', [MenuController::class, 'trash']);
    Route::patch('menus/{id}/restore', [MenuController::class, 'restore']);
    Route::delete('menus/{id}/force', [MenuController::class, 'forceDelete']);
    Route::apiResource('menus', MenuController::class);

    // 6. Quản lý người dùng (Users)
    Route::get('users/trash', [UserController::class, 'trash']);
    Route::patch('users/{id}/restore', [UserController::class, 'restore']);
    Route::delete('users/{id}/force', [UserController::class, 'forceDelete']);
    Route::apiResource('users', UserController::class);

    // 7. Liên hệ (Contacts)
    Route::get('contacts/trash', [ContactController::class, 'trash']);
    Route::patch('contacts/{id}/restore', [ContactController::class, 'restore']);
    Route::delete('contacts/{id}/force', [ContactController::class, 'forceDelete']);
    Route::apiResource('contacts', ContactController::class);

    // 8. Chủ đề bài viết (Post Topics)
    Route::get('post-topics/trash', [PostTopicController::class, 'trash']);
    Route::patch('post-topics/{id}/restore', [PostTopicController::class, 'restore']);
    Route::delete('post-topics/{id}/force', [PostTopicController::class, 'forceDelete']);
    Route::apiResource('post-topics', PostTopicController::class);

    // 9. Bài viết (Posts)
    Route::get('posts/trash', [PostController::class, 'trash']);
    Route::patch('posts/{id}/restore', [PostController::class, 'restore']);
    Route::delete('posts/{id}/force', [PostController::class, 'forceDelete']);
    Route::apiResource('posts', PostController::class);

    // 10. Trang đơn (Pages)
    Route::get('pages/trash', [PageController::class, 'trash']);
    Route::patch('pages/{id}/restore', [PageController::class, 'restore']);
    Route::delete('pages/{id}/force', [PageController::class, 'forceDelete']);
    Route::apiResource('pages', PageController::class);

    // 11. Nhà cung cấp (Suppliers)
    Route::get('suppliers/trash', [SupplierController::class, 'trash']);
    Route::patch('suppliers/{id}/restore', [SupplierController::class, 'restore']);
    Route::delete('suppliers/{id}/force', [SupplierController::class, 'forceDelete']);
    Route::apiResource('suppliers', SupplierController::class);

    // 12. Phiếu nhập/xuất kho (Stock Documents)
    Route::get('stock-documents/trash', [StockDocumentController::class, 'trash']);
    Route::patch('stock-documents/{id}/restore', [StockDocumentController::class, 'restore']);
    Route::delete('stock-documents/{id}/force', [StockDocumentController::class, 'forceDelete']);
    Route::apiResource('stock-documents', StockDocumentController::class);

    // 13. Chi tiết dòng phiếu kho (Stock Document Items)
    Route::apiResource('stock-document-items', StockDocumentItemController::class);
});
