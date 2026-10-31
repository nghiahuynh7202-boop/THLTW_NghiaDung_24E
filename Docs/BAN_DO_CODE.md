# 🗺️ BẢN ĐỒ CODE & HƯỚNG DẪN BẢO VỆ ĐỒ ÁN (SHOP HOA)
> **Kiến trúc:** Backend Laravel 11 (`backend/`) + Frontend Next.js App Router (`frontend/`) + MySQL (`shophoa999`).

---

## I. BẢN ĐỒ 10 CHỨC NĂNG TRỌNG TÂM

### 1. Sản Phẩm Nổi Bật (Featured Products)
- **Dữ liệu:** Cờ `products.is_featured` (1: nổi bật, 0: thường).
- **Frontend:** Admin tick tại [create/page.jsx:L247](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/admin/products/create/page.jsx#L247) & [update/page.jsx:L256](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/admin/products/update/page.jsx#L256); Khách lọc tại [useProducts.js:L52](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/hooks/useProducts.js#L52), gắn badge [ProductCard.jsx:L61](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/components/ProductCard.jsx#L61).
- **Route API:** `GET /api/products?is_featured=1` (Public), `POST/PUT /api/admin/products` (Admin).
- **Backend:** Kiểm thực [ProductRequest.php:L43](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Requests/ProductRequest.php#L43); Xử lý lưu & lọc tại [ProductController.php:L20-L42](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/ProductController.php#L20-L42) (`index`, `store`, `update`).
- **Database:** Bảng `products`, cột `is_featured` (`tinyint(4)` default 0), migration [2026_10_19_000001_add_is_featured_to_products_table.php:L16](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/database/migrations/2026_10_19_000001_add_is_featured_to_products_table.php#L16).

---

### 2. Đăng Ký & Đăng Nhập (Sanctum Auth)
- **Dữ liệu:** Email, mật khẩu mã hóa Bcrypt, tên, số điện thoại, vai trò `role` ('customer' | 'admin').
- **Frontend:** Form xử lý tại [login/page.jsx:L14](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/(shop)/login/page.jsx#L14) và [register/page.jsx:L16](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/(shop)/register/page.jsx#L16); Quản lý token toàn cục tại [AuthContext.jsx:L19](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/context/AuthContext.jsx#L19).
- **Route API:** `POST /api/register`, `POST /api/login`, `GET /api/me`.
- **Backend:** [AuthController.php:L24-L75](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/AuthController.php#L24-L75) (`register`, `login`); Model [User.php:L17](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Models/User.php#L17) dùng trait `HasApiTokens`.
- **Database:** Bảng `users` (`email`, `password`, `role`, `status`), bảng `personal_access_tokens` (Sanctum token).

---

### 3. Giỏ Hàng (Shopping Cart)
- **Dữ liệu:** Mảng sản phẩm (`product_id`, `name`, `price`, `qty`, `image`).
- **Frontend:** Context [CartContext.jsx:L39-L75](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/context/CartContext.jsx#L39-L75) (`addToCart`, `updateQuantity`, `removeFromCart`), giao diện [cart/page.jsx:L20](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/(shop)/cart/page.jsx#L20).
- **Route API:** `GET /api/cart`, `POST /api/cart`, `DELETE /api/cart/{id}` (khi đã login).
- **Backend:** [CartController.php:L20-L80](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/CartController.php#L20-L80) (`index`, `store`, `update`, `destroy`); Model [Cart.php:L10](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Models/Cart.php#L10).
- **Database:** `localStorage.getItem("cart")` (khách vãng lai) và bảng `cart` (`user_id`, `product_id`, `qty`).

---

### 4. Đặt Hàng (Checkout & Create Order)
- **Dữ liệu:** Khách nhận (`name`, `phone`, `address`, `note`), danh sách `items` (`product_id`, `qty`, `price`).
- **Frontend:** Form đặt hàng tại [checkout/page.jsx:L95-L156](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/(shop)/checkout/page.jsx#L95-L156) (`handleSubmitOrder`).
- **Route API:** `POST /api/orders`.
- **Backend:** [OrderController.php:L55-L125](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/OrderController.php#L55-L125) (`store` bọc trong `DB::transaction`, tự tính tổng tiền, tạo OrderDetail và xóa giỏ hàng).
- **Database:** Bảng `order` (thông tin chung, `total`, `status=1`) và bảng `orderdetail` (`order_id`, `product_id`, `price`, `qty`, `amount`).

---

### 5. Thanh Toán COD & QR SePay (VietQR)
- **Dữ liệu:** `order.payment_method` ('cod' | 'qr'), `order.payment_status` (0: Chưa thanh toán, 1: Đã thanh toán), nội dung `HOA {id}`.
- **Frontend:** Giao diện quét mã VietQR + Polling tự động kiểm tra tại [checkout/page.jsx:L70-L92](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/(shop)/checkout/page.jsx#L70-L92).
- **Route API:** `GET /api/orders/{id}/check-payment`, `POST /api/sepay/webhook`, `POST /api/sepay/mock-payment/{id}`.
- **Backend:** [SepayController.php:L16-L65](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/SepayController.php#L16-L65) (`webhook` bắt regex mã đơn, `mockPayment` test nhanh).
- **Database:** Bảng `order`, cột `payment_method`, `payment_status`.

---

### 6. Khuyến Mãi & Mã Giảm Giá (Coupons)
- **Dữ liệu:** Mã `code`, loại giảm giá (`pricesale` hoặc % giảm), hạn sử dụng, số lần dùng (`used_count`).
- **Frontend:** Gọi kiểm tra mã qua API check coupon tại [checkout/page.jsx](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/(shop)/checkout/page.jsx).
- **Route API:** `POST /api/productsales/check-coupon`.
- **Backend:** [ProductSaleController.php:L115-L145](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/ProductSaleController.php#L115-L145) (`checkCoupon`); Tăng số lượt dùng tại [OrderController.php:L110](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/OrderController.php#L110).
- **Database:** Bảng `productsale` (`code`, `pricesale`, `date_begin`, `date_end`, `limit_number`, `used_count`).

---

### 7. Danh Mục Sản Phẩm (Categories)
- **Dữ liệu:** Tên, slug, ảnh, trạng thái ẩn/hiện (`status`), cấu trúc phân cấp (`parent_id`).
- **Frontend:** Gọi API qua [categoryServices.js:L5-L25](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/services/categoryServices.js#L5-L25); Quản trị tại [admin/category/page.jsx](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/admin/category/page.jsx).
- **Route API:** `GET /api/categories` (Public), `GET/POST/PUT/DELETE /api/admin/categories` (Admin).
- **Backend:** [CategoryController.php:L20-L65](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/CategoryController.php#L20-L65) (`index` lọc `whereNull('parent_id')` cho khách, lấy toàn bộ cho admin).
- **Database:** Bảng `categories` (`id`, `parent_id`, `name`, `slug`, `status`).

---

### 8. Thương Hiệu (Brands)
- **Dữ liệu:** Tên, slug, hình ảnh logo, mô tả, trạng thái (`status`).
- **Frontend:** Gọi API qua [brandServices.js:L7-L30](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/services/brandServices.js#L7-L30); Giao diện admin tại [admin/brands/page.jsx](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/admin/brands/page.jsx).
- **Route API:** `GET /api/brands`, `GET/POST/PUT/DELETE /api/admin/brands`.
- **Backend:** [BrandController.php:L20-L75](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/BrandController.php#L20-L75) (`index`, `store`, `update`, `destroy`, `trash`).
- **Database:** Bảng `brands` (`id`, `name`, `slug`, `image`, `status`, `deleted_at`).

---

### 9. Phân Quyền Admin (Admin Authorization)
- **Dữ liệu:** Token Sanctum gửi trong header `Authorization: Bearer <token>` và giá trị `users.role = 'admin'`.
- **Frontend:** Gắn tự động token trong [axiosAdmin.js:L32-L40](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/lib/axiosAdmin.js#L32-L40); Chặn trang tại [AdminGuard.jsx:L15-L35](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/components/Admin/AdminGuard.jsx#L15-L35).
- **Route API:** Nhóm route tiền tố `/api/admin/*` được bảo vệ bằng middleware.
- **Backend:** Middleware [EnsureAdmin.php:L14-L28](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Middleware/EnsureAdmin.php#L14-L28); Khai báo nhóm tại [routes/api.php:L86](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/routes/api.php#L86) (`middleware(['auth:sanctum', 'admin'])`).
- **Database:** Bảng `users`, cột `role`.

---

### 10. Quản Lý Đơn Hàng (Order Management)
- **Dữ liệu:** Trạng thái đơn hàng `status` (1: Chờ xác nhận, 2: Đang xử lý, 3: Đang giao, 4: Hoàn thành, 5: Đã hủy).
- **Frontend:** Quản trị tại [admin/order/page.jsx](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/admin/order/page.jsx); Gọi API qua [orderServices.js:L17-L45](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/services/orderServices.js#L17-L45).
- **Route API:** `GET /api/admin/orders`, `PUT /api/admin/orders/{id}`, `PATCH /api/admin/orders/{id}/cancel`.
- **Backend:** [OrderController.php:L23-L52](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/OrderController.php#L23-L52) (`index` lọc trạng thái / tìm kiếm), [OrderController.php:L144-L182](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/OrderController.php#L144-L182) (`update`, `cancel`).
- **Database:** Bảng `order` (`status`, `cancel_reason`, `payment_status`).

---

## II. 10 CÂU HỎI GIẢNG VIÊN HAY HỎI & CÂU TRẢ LỜI NGẮN GỌN

#### Câu 1: Em lưu token đăng nhập ở đâu? Làm sao backend biết ai đang gửi request?
- **Trả lời:** Token lưu ở `localStorage` của trình duyệt. Mỗi khi gửi request đến các API cần đăng nhập, axios interceptor tự động đính kèm header `Authorization: Bearer <token>`. Backend dùng middleware `auth:sanctum` tra cứu token trong bảng `personal_access_tokens` để xác thực `User`.
- **Vị trí code:** [axiosAdmin.js:L38](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/lib/axiosAdmin.js#L38) (gắn token) và [routes/api.php:L86](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/routes/api.php#L86) (`auth:sanctum`).

#### Câu 2: Phân quyền Admin và Khách hàng được chặn ở đâu để bảo mật?
- **Trả lời:** Chặn 2 lớp: Frontend dùng `AdminGuard` kiểm tra role người dùng để chuyển hướng; Backend dùng Middleware `EnsureAdmin` kiểm tra trực tiếp cột `users.role === 'admin'`. Nếu khách cố tình gọi API admin bằng Postman sẽ bị trả về mã HTTP 403 Forbidden.
- **Vị trí code:** [EnsureAdmin.php:L22](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Middleware/EnsureAdmin.php#L22) và [AdminGuard.jsx:L25](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/components/Admin/AdminGuard.jsx#L25).

#### Câu 3: Tại sao khi bấm Đặt hàng em lại dùng DB::transaction?
- **Trả lời:** Vì quy trình đặt hàng gồm nhiều bước ghi dữ liệu: tạo đơn (`order`), tạo nhiều chi tiết đơn (`orderdetail`), trừ giỏ hàng và tăng lượt mã giảm giá. Dùng `DB::transaction` đảm bảo tính toàn vẹn (ACID): nếu bất kỳ bước nào lỗi thì toàn bộ dữ liệu sẽ tự Rollback, không để lại đơn rác.
- **Vị trí code:** [OrderController.php:L62](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/OrderController.php#L62).

#### Câu 4: Chức năng thanh toán QR SePay tự động xác nhận tiền như thế nào?
- **Trả lời:** Khách chuyển khoản quét mã VietQR có nội dung `HOA {id_đơn}`. Ngân hàng báo tiền về hệ thống SePay, SePay bắn một webhook HTTP POST sang route `/api/sepay/webhook`. Backend dùng Regex đọc ra mã đơn, kiểm tra và cập nhật `payment_status = 1`. Frontend chạy Polling liên tục kiểm tra `check-payment` để hiển thị màn hình thành công.
- **Vị trí code:** [SepayController.php:L26-L36](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/SepayController.php#L26-L36) và [checkout/page.jsx:L73-L87](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/app/(shop)/checkout/page.jsx#L73-L87).

#### Câu 5: Chức năng Sản phẩm nổi bật xử lý từ database lên giao diện ra sao?
- **Trả lời:** Database lưu cờ `is_featured` (0 hoặc 1) trong bảng `products`. Admin bật/tắt cờ này qua checkbox. Khi trang chủ hiển thị, hook `useProducts` gọi API và lọc ra các sản phẩm có `is_featured === true`, hiển thị thêm badge `⭐ Nổi bật` qua component `ProductCard`.
- **Vị trí code:** [useProducts.js:L53](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/hooks/useProducts.js#L53) và [ProductCard.jsx:L61](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/components/ProductCard.jsx#L61).

#### Câu 6: Tính năng Thùng rác (Xóa mềm - Soft Delete) hoạt động thế nào?
- **Trả lời:** Model `Product` sử dụng trait `SoftDeletes`. Khi admin xóa sản phẩm, Laravel không xóa hẳn dòng trong MySQL mà chỉ gán thời gian vào cột `deleted_at` và đổi `status = 0`. Khách hàng truy cập sẽ tự động bị loại bỏ qua Global Scope của Laravel, admin muốn khôi phục thì gọi hàm `restore()`.
- **Vị trí code:** [Product.php:L15](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Models/Product.php#L15) và [ProductController.php:L134-L170](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/ProductController.php#L134-L170) (`destroy`, `trash`, `restore`).

#### Câu 7: Tại sao khi cập nhật sản phẩm có file ảnh bằng method PUT lại phải gửi `_method: PUT` qua POST?
- **Trả lời:** Do giao thức HTTP chuẩn và PHP core không parse được dữ liệu `multipart/form-data` (upload file) qua phương thức `PUT`. Để khắc phục, ta gửi request bằng phương thức `POST` nhưng kèm trường `_method = PUT` (Method Spoofing của Laravel).
- **Vị trí code:** [productServices.js:L116-L121](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/services/productServices.js#L116-L121).

#### Câu 8: Cấu trúc danh mục đa cấp (Cha - Con) được thiết kế và truy vấn như thế nào?
- **Trả lời:** Bảng `categories` có cột `parent_id` tự trỏ về `id` của chính nó (Self-referencing Foreign Key). Trong model khai báo quan hệ `children()` (`hasMany`). Khi khách xem trang chủ, API lọc `whereNull('parent_id')` kèm `with('children')` để lấy toàn bộ cây danh mục chỉ trong 1-2 câu truy vấn SQL tối ưu.
- **Vị trí code:** [Category.php:L35-L42](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Models/Category.php#L35-L42) và [CategoryController.php:L22-L26](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/CategoryController.php#L22-L26).

#### Câu 9: Tổng tiền đơn hàng được tính ở frontend hay backend? Tại sao?
- **Trả lời:** Backend tự tính toán lại toàn bộ đơn giá của từng sản phẩm từ bảng `products` trong database, không tin tưởng tổng tiền client gửi lên để phòng chống việc hacker dùng F12 sửa giá sản phẩm trong request.
- **Vị trí code:** [OrderController.php:L66-L84](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/OrderController.php#L66-L84).

#### Câu 10: Phân trang (Pagination) hoạt động như thế nào giữa Frontend và Backend?
- **Trả lời:** Backend sử dụng `$query->paginate($perPage)`, trả về mảng `data` cùng object `meta` (chứa `current_page`, `last_page`, `total`). Frontend nhận `page` từ URL hoặc state để hiển thị danh sách nút bấm và số trang tương ứng.
- **Vị trí code:** [ProductController.php:L41](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/app/Http/Controllers/Api/ProductController.php#L41) và [productServices.js:L133-L144](file:///Users/waang0702/THLTW_NghiaDung_24E/frontend/services/productServices.js#L133-L144).
