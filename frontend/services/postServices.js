import axiosAdmin from "@/lib/axiosAdmin";
import axiosClient from "@/lib/axiosClient";

const ADMIN_POSTS = "/admin/posts";

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.posts)) return res.posts;
  return [];
}

function extractItem(res) {
  return res?.data?.data ?? res?.data ?? res ?? null;
}

// 1. Lấy danh sách bài viết công khai (Client)
export async function getPublicPosts(params = {}) {
  try {
    const res = await axiosClient.get("/posts", { params });
    return extractList(res);
  } catch {
    try {
      const res = await axiosAdmin.get(ADMIN_POSTS, { params });
      return extractList(res);
    } catch {
      return [];
    }
  }
}

// 1.1 Lấy danh sách bài viết kèm metadata phân trang (Client)
export async function getPublicPostsWithPagination(params = {}) {
  try {
    const res = await axiosClient.get("/posts", { params });
    const items = extractList(res);
    const meta = res?.meta ?? res?.pagination ?? {
      current_page: res?.current_page ?? 1,
      last_page: res?.last_page ?? 1,
      total: res?.total ?? items.length,
      per_page: res?.per_page ?? 9,
    };
    return { data: items, meta };
  } catch (error) {
    console.error("Lỗi getPublicPostsWithPagination:", error);
    return { data: [], meta: { current_page: 1, last_page: 1, total: 0, per_page: 9 } };
  }
}

// 2. Lấy danh sách bài viết (Admin)
export async function getAdminPosts(params = {}) {
  const res = await axiosAdmin.get(ADMIN_POSTS, { params });
  return {
    data: extractList(res),
    meta: res?.meta ?? res?.pagination ?? null,
  };
}

// 2. Lấy chi tiết bài viết theo ID
export async function getPostById(id) {
  try {
    const res = await axiosAdmin.get(`${ADMIN_POSTS}/${id}`);
    return extractItem(res);
  } catch {
    const res = await axiosClient.get(`/posts/${id}`);
    return extractItem(res);
  }
}

// 3. Thêm mới bài viết (Admin)
export async function createPost(formData) {
  const res = await axiosAdmin.post(ADMIN_POSTS, formData);
  return {
    data: extractItem(res),
    message: res?.message ?? "Thêm bài viết thành công",
  };
}

// 4. Cập nhật bài viết (Admin)
export async function updatePost(id, formData) {
  let res;
  if (formData instanceof FormData) {
    if (!formData.has("_method")) {
      formData.append("_method", "PUT");
    }
    res = await axiosAdmin.post(`${ADMIN_POSTS}/${id}`, formData);
  } else {
    res = await axiosAdmin.put(`${ADMIN_POSTS}/${id}`, formData);
  }
  return {
    data: extractItem(res),
    message: res?.message ?? "Cập nhật bài viết thành công",
  };
}

// 5. Xóa tạm bài viết vào thùng rác (Admin)
export async function deletePost(id) {
  const res = await axiosAdmin.delete(`${ADMIN_POSTS}/${id}`);
  return {
    message: res?.message ?? "Đã chuyển bài viết vào thùng rác",
  };
}

// 6. Lấy danh sách bài viết trong thùng rác
export async function getTrashPosts(page = 1, pageSize = 10) {
  const res = await axiosAdmin.get(`${ADMIN_POSTS}/trash`, {
    params: { page, per_page: pageSize },
  });
  const list = extractList(res);
  return {
    data: list,
    pagination: {
      total: res?.meta?.total ?? list.length,
      pageCount: res?.meta?.last_page ?? 1,
      currentPage: res?.meta?.current_page ?? page,
    },
  };
}

// 7. Khôi phục bài viết từ thùng rác
export async function restorePost(id) {
  const res = await axiosAdmin.patch(`${ADMIN_POSTS}/${id}/restore`);
  return {
    message: res?.message ?? "Khôi phục bài viết thành công",
  };
}

// 8. Xóa vĩnh viễn bài viết
export async function forceDeletePost(id) {
  const res = await axiosAdmin.delete(`${ADMIN_POSTS}/${id}/force`);
  return {
    message: res?.message ?? "Xóa vĩnh viễn bài viết thành công",
  };
}

// 9. Lấy danh sách chủ đề bài viết để chọn
export async function getPostTopics() {
  try {
    const res = await axiosAdmin.get("/admin/post-topics", {
      params: { per_page: 100 },
    });
    return extractList(res);
  } catch {
    try {
      const res = await axiosClient.get("/post-topics");
      return extractList(res);
    } catch {
      return [];
    }
  }
}
