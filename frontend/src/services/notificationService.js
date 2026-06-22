import axiosInstance from "../api/axios";

export const getMyNotifications = async () => {
  const response = await axiosInstance.get("/notifications");
  return response.data.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};

export const getNotificationBadges = async () => {
  const response = await axiosInstance.get("/notifications/badges/counts");
  return response.data.data;
};

export const markNotificationsReadByType = async (type) => {
  const response = await axiosInstance.patch("/notifications/read-by-type", { type });
  return response.data;
};
