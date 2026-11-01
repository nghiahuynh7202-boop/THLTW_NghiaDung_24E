import axiosAdmin from "@/lib/axiosAdmin";
import axiosClient from "@/lib/axiosClient";

// Gửi form liên hệ từ khách hàng (Client)
export async function sendContact(data) {
  const res = await axiosClient.post("/contacts", data);
  return res.data || res;
}

export const createContact = sendContact;

// 1. Lấy danh sách liên hệ (hỗ trợ phân trang, lọc trạng thái, tìm kiếm)
export async function getContacts(params = {}) {
  const res = await axiosAdmin.get("/admin/contacts", { params });
  return res;
}

// 2. Lấy thông tin chi tiết một liên hệ theo ID
export async function getContactById(id) {
  const res = await axiosAdmin.get(`/admin/contacts/${id}`);
  return res.data || res;
}

// 3. Phản hồi hoặc cập nhật trạng thái liên hệ
export async function updateContact(id, data) {
  const res = await axiosAdmin.put(`/admin/contacts/${id}`, data);
  return res.data || res;
}

// 4. Xóa tạm liên hệ (chuyển vào thùng rác)
export async function deleteContact(id) {
  return await axiosAdmin.delete(`/admin/contacts/${id}`);
}

// 5. Lấy danh sách liên hệ trong thùng rác
export async function getTrashContacts(params = {}) {
  return await axiosAdmin.get("/admin/contacts/trash", { params });
}

// 6. Khôi phục liên hệ từ thùng rác
export async function restoreContact(id) {
  return await axiosAdmin.patch(`/admin/contacts/${id}/restore`);
}

// 7. Xóa vĩnh viễn liên hệ khỏi database
export async function forceDeleteContact(id) {
  return await axiosAdmin.delete(`/admin/contacts/${id}/force`);
}
