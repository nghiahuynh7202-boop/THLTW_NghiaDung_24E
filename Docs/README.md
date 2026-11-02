# HƯỚNG DẪN KIỂM THỬ ĐỒ ÁN (SHOP HOA TƯƠI)


---

## MỤC LỤC


---

## 1. Hướng dẫn cài đặt

### 1.1. Tên cơ sở dữ liệu
* Tên Database:`shophoa999`
* Tạo mới database có tên `shophoa999` với bảng mã `utf8mb4_unicode_ci` trong phpMyAdmin hoặc MySQL.



### 1.2. File SQL
* **Đường dẫn file:** `Docs/shophoa999.sql`
bảng mã `utf8mb4_unicode_ci` trong phpMyAdmin hoặc MySQL.*
* mở mục import theo file database trong Docs vào nhấn nút import
### 1.3. Chạy ứng dụng

#### Bước 1: Khởi động Backend (Laravel)
Mở cửa sổ Terminal thứ nhất:
```bash
cd backend
composer install           # Cài đặt thư viện (nếu mới clone)
php artisan storage:link   # Tạo liên kết hiển thị ảnh
php artisan serve          # Chạy server API
```
--> Backend sẽ chạy tại: **`http://localhost:8000`**

#### Bước 2: Khởi động Frontend (Next.js)
Mở cửa sổ Terminal thứ hai:
```bash
cd frontend
npm install                # Cài đặt thư viện (nếu mới clone)
npm run dev                # Khởi động giao diện website
```
--> Frontend sẽ chạy tại: **`http://localhost:3000`**

---

## 2. Tài khoản đăng nhập mẫu

### 2.1. Tài khoản Shop (Khách hàng / Thành viên mua hoa)
* **Đường dẫn đăng nhập:** `http://localhost:3000/login`
* **Email:** `khachhang999@gmail.com`
* **Password:** `123456789`
* *(Quyền hạn: Xem hoa, thêm giỏ hàng, đặt hàng, đánh giá sao, xem lịch sử đơn).*

### 2.2. Tài khoản Admin (Quản trị viên)
* **Đường dẫn đăng nhập:** `http://localhost:3000/admin/login` *(hoặc đăng nhập tại `/login` sẽ tự chuyển vào trang quản trị)*
* **Email:** `admin@gmail.com`
* **Password:** `123456789`
* *(Quyền hạn: Toàn quyền quản lý sản phẩm, danh mục, đổi trạng thái đơn hàng, duyệt đánh giá, quản lý kho).*

---

## 3. Thanh toán online

### 3.1. Cách quét mã (VietQR Tự Động)
1. Thêm một bó hoa vào giỏ hàng Bấm **Thanh toán** (`/checkout`).
2. Điền thông tin giao hàng Tại mục Phương thức thanh toán, chọn **"Quét mã VietQR"** 
3. Bấm **"Hoàn tất đặt hàng"**.
4. Màn hình sẽ hiển thị mã **VietQR** chuẩn ngân hàng kèm số tiền và cú pháp `HOA {mã_đơn}`.
+Lưu ý: phải chạy sever riêng của sepay mới thanh toán được, ở đây cô chưa có sever đó để chạy và test được thanh toán tự động qua sepay bằng tiền thật, nên bọn khuyên cô chuyển sang phương thức toán  khi nhận hàng để demo luồng thanh toán(nếu cô muốn dùng sever thật  thì cô liên hệ zalo của em ạ: 0343977821)


---

## 4. Hướng dẫn OTP và áp mã khuyến mãi

### 4.1. Hướng dẫn lấy và nhập mã OTP (Quên mật khẩu)
1. Truy cập URL trang Quên mật khẩu: `http://localhost:3000/forgot-password`
2. vào profile sửa địa chỉ gmail thành gmail mà cô muốn test quên mật khẩu
3. Nhập email tài khoản: Nhập email mà cô đã sửa ở bước 2 Bấm **"Gửi mã OTP"**.
4. **Cách lấy mã OTP:**
   * Mã OTP gồm 6 chữ số sẽ được gửi về hòm thư Gmail
   * **Xem trực tiếp trên CSDL để test nhanh:** Mở bảng `password_reset_tokens` trong database `shophoa999`, copy mã tại cột **`token`** (ví dụ: `849201`).
5. Nhập mã OTP đó vào ô xác thực kèm Mật khẩu mới Bấm **"Xác nhận đặt lại mật khẩu"** là hoàn tất.
6. quay lại trang login và đăng nhập lại bằng mật khẩu mới

### 4.2. Hướng dẫn áp mã khuyến mãi (Giảm giá đơn hàng)
1. Chọn sản phẩm bất kỳ bỏ vào giỏ hàng và chuyển sang trang Thanh toán (`/checkout`).
2. Tại from nhập  "Mã khuyến mãi / Giảm giá"**, nhập 1 trong 2 mã sau:
   * **`GIAM10`**: Giảm ngay **10%** trên tổng tiền (áp dụng cho đơn từ 100.000đ trở lên).
   * **`HOA20K`**: Giảm ngay **100%** giá trị đơn hàng (áp dụng cho đơn từ 100đ).
3. Bấm nút **"Áp dụng"**:
   * Hệ thống sẽ hiển thị dòng tiền được giảm màu xanh.
   * Tổng thanh toán sẽ tự động được trừ đi số tiền tương ứng.



### 4.3. Hướng dẫn nhận thông báo hóa đơn đã đặt về Gmail
1. Chọn sản phẩm hoa bất kỳ bỏ vào giỏ hàng và bấm **Thanh toán** (`http://localhost:3000/checkout`).
2. nhập thông tin khách và thực hiện chọn phương thức thanh toán bằng QR, sau khi thanh toán đơn hàng thành công
3. **Cách kiểm tra kết quả:**
   * **Cách 1 (Xem trực tiếp trên hòm thư Gmail):** Mở hộp thư Gmail vừa nhập (kiểm tra cả mục *Hộp thư đến* hoặc mục *Spam/Thư rác*). Hệ thống sẽ tự động gửi một email hóa đơn có tiêu đề:  
     `🌸 Xác nhận đặt hàng thành công - Đơn hàng #DH...`  
     Bên trong email có đầy đủ: Mã đơn, tên hoa, số lượng, giá tiền, phí ship và tổng tiền thanh toán.
   * **Cách 2 (Xem offline nhanh trên máy):** Mở file [`backend/storage/logs/laravel.log`](file:///Users/waang0702/THLTW_NghiaDung_24E/backend/storage/logs/laravel.log) kéo xuống dưới cùng để xem toàn bộ nội dung email hóa đơn hệ thống vừa ghi nhận.


