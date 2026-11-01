import axiosClient from "@/lib/axiosClient";

// Gửi thông tin liên hệ từ khách hàng vào CSDL MySQL
export async function sendContact(data) {
  const response = await axiosClient.post("/contacts", data);
  return response.data || response;
}

