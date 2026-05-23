import axiosInstance from "../api/axios";

export const getOrderHistory = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/v1/orders", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching order history:", error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/v1/orders/${orderId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post("/v1/orders", orderData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await axiosInstance.patch(
      `/v1/orders/${orderId}/status`,
      statusData,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.delete(`/v1/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};
