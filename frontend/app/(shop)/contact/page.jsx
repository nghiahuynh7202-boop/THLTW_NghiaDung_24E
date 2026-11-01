"use client";

import { useState } from "react";
import { sendContact } from "@/services/contactServices";

export default function ContactPage() {
  // 1. Dữ liệu form liên hệ (khớp với bảng `contacts` trong MySQL)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // 2. Hàm gửi dữ liệu liên hệ lên Backend Laravel và lưu vào MySQL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError("Vui lòng điền họ tên, số điện thoại và nội dung liên hệ!");
      return;
    }

    try {
      setLoading(true);
      // Gọi API POST /api/contacts
      await sendContact({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        message: message.trim(),
      });

      // Báo thành công và xóa trắng ô nhập
      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Lỗi gửi liên hệ:", err);
      setError("Có lỗi xảy ra khi gửi liên hệ, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[70vh] py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Tiêu đề trang */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase text-gray-800">
            LIÊN HỆ VỚI CHÚNG TÔI
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gửi câu hỏi hoặc ý kiến đóng góp cho shop hoa tươi
          </p>
          <div className="w-14 h-1 bg-[#f68b1f] mx-auto mt-2 rounded" />
        </div>

        {/* Bố cục 2 cột: Thông tin bên trái, Form bên phải */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-200">
          
          {/* CỘT 1: THÔNG TIN CỦA SHOP */}
          <div className="space-y-4 text-sm text-gray-700">
            <h2 className="text-base font-bold text-gray-900 mb-2 border-b pb-2">
              THÔNG TIN SHOP HOA
            </h2>
            <p>
              <strong className="text-gray-900">Địa chỉ:</strong> 230 Lê Văn Việt, Tăng Nhơn Phú B, TP. Thủ Đức, TP.HCM
            </p>
            <p>
              <strong className="text-gray-900">Hotline:</strong> 028 7300 2010 - 024 7300 2010
            </p>
            <p>
              <strong className="text-gray-900">Email:</strong> cskh@hoayeuthuong.com
            </p>
            <p>
              <strong className="text-gray-900">Giờ mở cửa:</strong> 07:00 - 21:00 (Hàng ngày)
            </p>
            <p className="text-xs text-gray-500 pt-2 italic">
              * Chúng tôi sẽ liên hệ lại với bạn ngay sau khi nhận được thông tin.
            </p>
          </div>

          {/* CỘT 2: FORM GỬI LỜI NHẮN (LƯU VÀO MYSQL) */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4 border-b pb-2">
              GỬI TIN NHẮN
            </h2>

            {/* Thông báo thành công */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 text-xs rounded-lg font-medium">
                Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.
              </div>
            )}

            {/* Thông báo lỗi */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#f68b1f] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#f68b1f] bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập địa chỉ email (không bắt buộc)"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#f68b1f] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nội dung lời nhắn *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung cần hỗ trợ..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#f68b1f] bg-white resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#f68b1f] hover:bg-[#e07711] text-white text-xs font-bold uppercase rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Đang gửi..." : "Gửi liên hệ"}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
