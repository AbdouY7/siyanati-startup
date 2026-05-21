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

export const getProfessionalDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/statistics/professional-dashboard");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching professional dashboard stats:", error);
    throw error;
  }
};

export const toggleProfessionalAvailability = async (isAvailable) => {
  try {
    const response = await axiosInstance.patch("/statistics/professional-availability", {
      is_available: isAvailable,
    });
    window.dispatchEvent(
      new CustomEvent("professional-availability-change", {
        detail: { is_available: response.data.data.is_available },
      }),
    );
    return response.data.data;
  } catch (error) {
    console.error("Error toggling availability:", error);
    throw error;
  }
};
