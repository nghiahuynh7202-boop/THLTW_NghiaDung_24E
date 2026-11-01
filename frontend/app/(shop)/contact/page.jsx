"use client";

import { useEffect, useState } from "react";
import { sendContact } from "@/services/contactServices";
import { useAuth } from "@/context/AuthContext";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const { user } = useAuth();

  // 1. Dữ liệu form liên hệ
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Trạng thái gửi & lỗi validation theo từng ô nhập
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Tự động điền thông tin nếu thành viên đã đăng nhập
  useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Xóa lỗi của từng ô khi người dùng bắt đầu gõ lại
  const handleInputChange = (field, value, setter) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (generalError) setGeneralError("");
  };

  // 2. Kiểm tra dữ liệu ở phía Client (Frontend Validation)
  const validateClient = () => {
    const errors = {};
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    // Họ tên
    if (!trimmedName) {
      errors.name = "Vui lòng nhập họ và tên của bạn.";
    } else if (trimmedName.length > 100) {
      errors.name = "Họ tên không được vượt quá 100 ký tự.";
    }

    // Số điện thoại
    const phoneRegex = /^[0-9\-\+\(\)\s]{9,20}$/;
    if (!trimmedPhone) {
      errors.phone = "Vui lòng nhập số điện thoại liên lạc.";
    } else if (!phoneRegex.test(trimmedPhone)) {
      errors.phone = "Số điện thoại không hợp lệ (từ 9 - 15 chữ số).";
    }

    // Email (nếu nhập thì phải đúng định dạng)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      errors.email = "Địa chỉ email không đúng định dạng (VD: example@mail.com).";
    } else if (trimmedEmail.length > 150) {
      errors.email = "Email không được vượt quá 150 ký tự.";
    }

    // Nội dung góp ý
    if (!trimmedMessage) {
      errors.message = "Vui lòng nhập nội dung góp ý hoặc câu hỏi của bạn.";
    } else if (trimmedMessage.length > 2000) {
      errors.message = "Nội dung góp ý không được vượt quá 2000 ký tự.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 3. Xử lý gửi form liên hệ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setGeneralError("");

    // Nếu frontend validation không đạt thì dừng lại
    if (!validateClient()) return;

    setLoading(true);
    try {
      await sendContact({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        message: message.trim(),
      });

      // Thành công: Thông báo, xóa trắng form, làm mới lỗi
      setSuccess(true);
      setName(user?.name || "");
      setPhone(user?.phone || "");
      setEmail(user?.email || "");
      setMessage("");
      setFieldErrors({});
    } catch (err) {
      console.error("Lỗi gửi góp ý / liên hệ:", err);

      // Trường hợp 422: Lỗi validation từ Laravel
      if (err?.response?.status === 422) {
        const backendErrors = err.response.data?.errors || {};
        const formatted = {};
        for (const [key, msgs] of Object.entries(backendErrors)) {
          formatted[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        }
        setFieldErrors(formatted);
        setGeneralError(err.response.data?.message || "Vui lòng kiểm tra lại thông tin bên dưới!");
      } 
      // Trường hợp 429: Chống spam gửi liên tục (Throttle)
      else if (err?.response?.status === 429) {
        setGeneralError("Bạn đã gửi tin nhắn quá nhanh. Vui lòng đợi 1 phút trước khi gửi lại!");
      } else {
        setGeneralError("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-[75vh] py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Tiêu đề trang */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-gray-800 tracking-tight">
            LIÊN HỆ & GÓP Ý
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gửi câu hỏi, yêu cầu tư vấn hoặc ý kiến đóng góp cho shop hoa tươi
          </p>
          <div className="w-16 h-1 bg-[#f68b1f] mx-auto mt-2.5 rounded-full" />
        </div>

        {/* Khung thông tin 2 cột */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/80 p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
          
          {/* CỘT 1: THÔNG TIN LIÊN HỆ CỦA SHOP */}
          <div className="space-y-4 text-xs sm:text-sm text-gray-700">
            <h2 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              THÔNG TIN SHOP HOA
            </h2>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#f68b1f] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Địa chỉ:</strong>
                <span>230 Lê Văn Việt, Tăng Nhơn Phú B, TP. Thủ Đức, TP.HCM</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#f68b1f] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Hotline:</strong>
                <a href="tel:02873002010" className="text-[#f68b1f] font-semibold hover:underline">
                  028 7300 2010
                </a>
                <span> - </span>
                <a href="tel:02473002010" className="text-[#f68b1f] font-semibold hover:underline">
                  024 7300 2010
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#f68b1f] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Email hỗ trợ:</strong>
                <a href="mailto:cskh@hoayeuthuong.com" className="hover:underline text-gray-700">
                  cskh@hoayeuthuong.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#f68b1f] shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block">Thời gian làm việc:</strong>
                <span>07:00 - 21:00 (Từ Thứ 2 đến Chủ Nhật, cả ngày Lễ)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 text-xs text-gray-500 italic">
              * Nhân viên chăm sóc khách hàng sẽ phản hồi quý khách qua số điện thoại hoặc email trong vòng tối đa 2 giờ làm việc.
            </div>
          </div>

          {/* CỘT 2: FORM NHẬP THÔNG TIN */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
              GỬI LỜI NHẮN / GÓP Ý
            </h2>

            {/* Thông báo thành công */}
            {success && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Cảm ơn bạn! Lời nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.</span>
              </div>
            )}

            {/* Thông báo lỗi chung */}
            {generalError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Họ tên */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleInputChange("name", e.target.value, setName)}
                  placeholder="Nhập họ và tên của bạn"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors bg-white ${
                    fieldErrors.name
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-gray-300 focus:border-[#f68b1f]"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{fieldErrors.name}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handleInputChange("phone", e.target.value, setPhone)}
                  placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors bg-white ${
                    fieldErrors.phone
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-gray-300 focus:border-[#f68b1f]"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email <span className="text-gray-400 font-normal">(không bắt buộc)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange("email", e.target.value, setEmail)}
                  placeholder="Nhập email nếu muốn nhận phản hồi qua hòm thư"
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors bg-white ${
                    fieldErrors.email
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-gray-300 focus:border-[#f68b1f]"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Nội dung lời nhắn */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nội dung góp ý / liên hệ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => handleInputChange("message", e.target.value, setMessage)}
                  placeholder="Nhập câu hỏi, phản hồi về đơn hàng hoặc góp ý dịch vụ..."
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors bg-white resize-none ${
                    fieldErrors.message
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                      : "border-gray-300 focus:border-[#f68b1f]"
                  }`}
                />
                {fieldErrors.message && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{fieldErrors.message}</p>
                )}
              </div>

              {/* Nút gửi */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#f68b1f] hover:bg-[#e67300] text-white text-xs font-bold uppercase rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-98"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ĐANG GỬI TIN NHẮN...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>GỬI LỜI NHẮN</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
