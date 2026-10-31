import axiosAdmin from "@/lib/axiosAdmin";
import axiosClient from "@/lib/axiosClient";

const ADMIN_BANNERS = "/admin/banners";

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}

// 1. Lấy danh sách banner hiển thị trang chủ (Client)
export async function getPublicBanners() {
  try {
    const res = await axiosClient.get("/banners");
    return extractList(res);
  } catch {
    try {
      const res = await axiosAdmin.get(ADMIN_BANNERS);
      return extractList(res);
    } catch {
      return [];
    }
  }
}

// 2. Lấy danh sách banner (Admin)
export async function getAdminBanners() {
  const res = await axiosAdmin.get(ADMIN_BANNERS);
  return extractList(res);
}

// 3. Thêm mới banner kèm upload ảnh (Admin)
export async function createBanner(formData) {
  const res = await axiosAdmin.post(ADMIN_BANNERS, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data ?? res;
}

// 4. Xóa banner (Admin)
export async function deleteBanner(id) {
  const res = await axiosAdmin.delete(`${ADMIN_BANNERS}/${id}`);
  return res?.data ?? res;
}
