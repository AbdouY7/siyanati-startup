import axiosInstance from "../api/axios";

/**
 * Get all stores (approved store profiles)
 */
export const getAllStores = async () => {
  try {
    const response = await axiosInstance.get("/shops");
    return response.data.stores;
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw error;
  }
};

/**
 * Get a single store by its user ID (returns the full user + store_profile)
 */
export const getStoreById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error(`Error fetching store ${id}:`, error);
    throw error;
  }
};

/**
 * Get parts sold by a specific store (seller_id)
 */
export const getStorePartsBySellerId = async (sellerId) => {
  try {
    const response = await axiosInstance.get("/parts", {
      params: { seller_id: sellerId },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching parts for store ${sellerId}:`, error);
    throw error;
  }
};

export const updateMyStoreProfile = async (data) => {
  try {
    let response;
    if (data instanceof FormData) {
      response = await axiosInstance.put("/stores/me", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
    } else {
      response = await axiosInstance.put("/stores/me", data);
    }
    return response.data;
  } catch (error) {
    console.error("Error updating store profile:", error);
    throw error;
  }
};
