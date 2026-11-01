"use client";

import Link from "next/link";
import { Phone, MapPin, ShoppingBag, ArrowRight } from "lucide-react";

/**
 * Trang Giới thiệu (About Us)
 * Thiết kế theo bố cục đối xứng Zig-Zag chuẩn đồ án:
 * - Khối 1: Banner "VỀ CHÚNG TÔI" nền tối sang trọng
 * - Khối 2: Cụm ảnh tròn kép nét đứt (Trái) + Sứ mệnh & Cam kết (Phải)
 * - Khối 3: Câu chuyện & Dịch vụ (Trái) + Cụm ảnh tròn kép nét đứt (Phải)
 * - Khối 4: Banner liên hệ & Nút điều hướng mua hàng
 */
export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen font-sans">
      {/* 1. HERO BANNER: Nền ảnh tối phủ overlay với chữ VỀ CHÚNG TÔI màu trắng chính giữa */}
      <div className="relative w-full h-52 sm:h-64 md:h-72 bg-gray-950 overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=1920&q=80"
          alt="Banner Về Chúng Tôi"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          onError={(e) => {
            e.currentTarget.src = "/images/434410_dong-hanh-cung-nong-dan-viet-nam.jpg";
          }}
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-widest">
            VỀ CHÚNG TÔI
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-300 mt-2.5 font-medium">
            <Link href="/" className="hover:text-orange-400 transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-orange-400 font-semibold">Giới thiệu</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-24">
        {/* 2. KHỐI 1: CỤM ẢNH TRÒN KÉP BÊN TRÁI - NỘI DUNG CHỮ BÊN PHẢI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Cột ảnh tròn kép (Viền nét đứt lớn + Vòng tròn nhỏ đè góc) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-88 md:h-88">
              {/* Vòng tròn lớn viền nét đứt */}
              <div className="w-full h-full rounded-full border-2 border-dashed border-orange-300 p-2 sm:p-2.5">
                <div className="w-full h-full rounded-full overflow-hidden shadow-lg bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80"
                    alt="Cửa hàng hoa D2 Flower"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/hoa.jpg";
                    }}
                  />
                </div>
              </div>

              {/* Vòng tròn nhỏ đè góc dưới bên trái */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=400&q=80"
                  alt="Đội ngũ nghệ nhân cắm hoa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/434410_dong-hanh-cung-nong-dan-viet-nam.jpg";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Cột nội dung chữ chi tiết bên phải */}
          <div className="lg:col-span-7 space-y-3.5 text-gray-700">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-widest block">
              D2 Flower Studio
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-[#e65100] leading-snug">
              “Kiến tạo không gian, ươm mầm hạnh phúc”, D2 Flower luôn:
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Luôn đặt ra và tuân theo sứ mệnh: “Trao gửi yêu thương qua từng đóa hoa tươi thắm”, D2 Flower luôn nỗ lực không ngừng mỗi ngày:
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-gray-600 pt-1">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e65100] mt-1.5 shrink-0" />
                <span>
                  <strong>Tận tâm trong từng tác phẩm:</strong> Tuyển chọn tỉ mỉ từng cành hoa khỏe, nở đều từ sáng sớm để nghệ nhân cắm hoa thực hiện.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e65100] mt-1.5 shrink-0" />
                <span>
                  <strong>Sản phẩm thẩm mỹ cao:</strong> Đón đầu các phong cách cắm hoa nghệ thuật hiện đại, sang trọng từ Hàn Quốc, châu Âu và Nhật Bản.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e65100] mt-1.5 shrink-0" />
                <span>
                  <strong>Hoàn hảo về thẩm mỹ, trọn vẹn về ý nghĩa:</strong> Đáp ứng tinh tế mọi nhu cầu hoa sinh nhật, hoa khai trương phát tài, hoa cưới và hoa chia buồn trang trọng.
                </span>
              </li>
            </ul>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-2">
              Tập thể cán bộ, nghệ nhân cắm hoa D2 Flower luôn tìm tòi, nghiên cứu, nâng cao năng lực để mang tới cho khách hàng những sản phẩm hoa tươi cao cấp, chất lượng hoàn hảo và giá trị cảm xúc đong đầy nhất.
            </p>
          </div>
        </div>

        {/* 3. KHỐI 2: NỘI DUNG CHỮ BÊN TRÁI - CỤM ẢNH TRÒN KÉP BÊN PHẢI (ZIG-ZAG) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Cột chữ bên trái */}
          <div className="lg:col-span-7 space-y-3.5 text-gray-700 order-2 lg:order-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#e65100] leading-snug">
              Trải nghiệm hoa tươi nghệ thuật & dịch vụ tận tâm
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Với ngôn ngữ thiết kế đa dạng, từ phong cách tối giản mộc mạc, hiện đại thanh lịch đến phong cách châu Âu quý phái... chúng tôi vinh dự là đơn vị thiết kế và giao hoa tươi uy tín cho hàng ngàn khách hàng cá nhân và doanh nghiệp lớn tại TP. Hồ Chí Minh cùng các tỉnh thành lân cận.
            </p>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Ngoài ra, với kinh nghiệm nhiều năm trong nghề, D2 Flower cũng để lại dấu ấn sâu sắc khi trực tiếp đảm nhiệm trang trí hoa tươi cho hàng trăm buổi tiệc cưới lãng mạn, sự kiện ra mắt thương hiệu, hội nghị cao cấp và sảnh khách sạn sang trọng.
            </p>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Mỗi sản phẩm hoa trước khi giao đều được kiểm tra độ tươi nghiêm ngặt, chụp ảnh gửi khách duyệt và được vận chuyển bằng phương tiện bảo quản chuyên dụng, đảm bảo giữ nguyên form dáng trọn vẹn đến tận tay người nhận.
            </p>
          </div>

          {/* Cột ảnh tròn kép bên phải */}
          <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-88 md:h-88">
              {/* Vòng tròn lớn viền nét đứt */}
              <div className="w-full h-full rounded-full border-2 border-dashed border-orange-300 p-2 sm:p-2.5">
                <div className="w-full h-full rounded-full overflow-hidden shadow-lg bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
                    alt="Thiết kế hoa tiệc & sự kiện"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/434433_34-tinh-thanh.jpg";
                    }}
                  />
                </div>
              </div>

              {/* Vòng tròn nhỏ đè góc dưới bên trái */}
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu bình hoa trang trí cao cấp"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/434436_gio-trai-cay.jpg";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}

