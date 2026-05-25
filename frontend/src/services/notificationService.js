import axiosInstance from "../api/axios";

export const getMyNotifications = async () => {
  const response = await axiosInstance.get("/notifications");
  return response.data.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};
