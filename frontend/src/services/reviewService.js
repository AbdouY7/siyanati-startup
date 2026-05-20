import axiosInstance from "../api/axios";

/**
 * Create a new review (rating & comment)
 * Expected payload: { target_id, target_type, rating, comment, media_urls, order_id, appointment_id }
 */
export const createReview = async (reviewData) => {
  try {
    const response = await axiosInstance.post("/reviews", reviewData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

/**
 * Get reviews
 * Optional filters: { target_id, target_type, page, limit }
 */
export const getReviews = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/reviews", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};
