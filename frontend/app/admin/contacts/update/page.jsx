"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getContactById, updateContact } from "@/services/contactServices";
import { MessageSquare, ArrowLeft, Send, RefreshCw, Phone, Mail, Clock } from "lucide-react";

function EditContactContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState("da_tra_loi");

  useEffect(() => {
    if (!id) {
      alert("Không tìm thấy liên hệ cần xem!");
      router.push("/admin/contacts");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const item = await getContactById(id);
        if (item) {
          setContact(item);
          setReplyText(item.reply || "");
          setReplyStatus(item.status === "chua_xem" ? "da_xem" : item.status);
        }
      } catch (err) {
        console.error("Lỗi tải thông tin liên hệ:", err);
        alert("Không thể tải thông tin liên hệ!");
        router.push("/admin/contacts");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateContact(id, {
        reply: replyText.trim(),
        status: replyStatus,
      });

      alert("✅ Đã lưu phản hồi liên hệ thành công!");
      router.push("/admin/contacts");
    } catch (err) {
      console.error("Lỗi lưu phản hồi:", err);
      const msg = err?.response?.data?.message || err?.message || "Lỗi lưu phản hồi";
      alert("❌ " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#f68b1f]" />
        Đang tải dữ liệu liên hệ...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/contacts"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#f68b1f]" />
              Chi Tiết & Phản Hồi Thư #{id}
            </h1>
            <p className="text-sm text-gray-500">Xem nội dung thư và ghi nhận phản hồi / xử lý</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        {/* Thông tin người gửi */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
          <div>
            <span className="font-semibold text-gray-500 block mb-0.5">Khách hàng:</span>
            <span className="font-bold text-gray-800 text-base">{contact?.name}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block mb-0.5">Thời gian gửi:</span>
            <span className="text-gray-700">{contact?.created_at || "—"}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block mb-0.5">Số điện thoại:</span>
            <span className="text-gray-800 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> {contact?.phone || "Không có"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-500 block mb-0.5">Email:</span>
            <span className="text-gray-800 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> {contact?.email || "Không có"}
            </span>
          </div>
        </div>

        {/* Nội dung khách gửi */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Nội dung thư khách gửi:
          </label>
          <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-xl text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
            {contact?.message}
          </div>
        </div>

        {/* Form phản hồi */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Nội dung phản hồi (Admin):
            </label>
            <textarea
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Nhập nội dung phản hồi gửi khách hàng..."
              className="w-full p-3.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#f68b1f]"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Trạng thái xử lý:
            </label>
            <select
              value={replyStatus}
              onChange={(e) => setReplyStatus(e.target.value)}
              className="w-full py-2.5 px-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#f68b1f] bg-white"
            >
              <option value="chua_xem">Chưa xem</option>
              <option value="da_xem">Đã xem</option>
              <option value="da_tra_loi">Đã phản hồi</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Link
              href="/admin/contacts"
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Quay lại
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#f68b1f] hover:bg-[#e67300] rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? "Đang lưu..." : "Lưu Phản Hồi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditContactPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#f68b1f]" />
        </div>
      }
    >
      <EditContactContent />
    </Suspense>
  );
}
