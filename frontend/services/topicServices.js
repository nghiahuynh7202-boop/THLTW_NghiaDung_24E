import axiosAdmin from "@/lib/axiosAdmin";

// 1. Lấy danh sách chủ đề bài viết
export async function getTopics(params = {}) {
  const res = await axiosAdmin.get("/admin/post-topics", { params });
  return res;
}

// 2. Lấy chi tiết chủ đề theo ID
export async function getTopicById(id) {
  const res = await axiosAdmin.get(`/admin/post-topics/${id}`);
  return res.data || res;
}

// 3. Thêm mới chủ đề bài viết
export async function createTopic(data) {
  const res = await axiosAdmin.post("/admin/post-topics", data);
  return res.data || res;
}

// 4. Cập nhật chủ đề bài viết
export async function updateTopic(id, data) {
  const res = await axiosAdmin.put(`/admin/post-topics/${id}`, data);
  return res.data || res;
}

// 5. Xóa chủ đề bài viết (vào thùng rác)
export async function deleteTopic(id) {
  return await axiosAdmin.delete(`/admin/post-topics/${id}`);
}

// 6. Lấy danh sách chủ đề trong thùng rác
export async function getTrashTopics(params = {}) {
  const res = await axiosAdmin.get("/admin/post-topics/trash", { params });
  return res;
}

// 7. Khôi phục chủ đề từ thùng rác
export async function restoreTopic(id) {
  return await axiosAdmin.patch(`/admin/post-topics/${id}/restore`);
}

// 8. Xóa vĩnh viễn chủ đề khỏi database
export async function forceDeleteTopic(id) {
  return await axiosAdmin.delete(`/admin/post-topics/${id}/force`);
}
