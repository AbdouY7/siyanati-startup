import axiosInstance from "../api/axios";

export const getUserStatistics = async () => {
  try {
    const response = await axiosInstance.get("/statistics/user");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
};
