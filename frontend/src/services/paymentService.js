import axiosInstance from '../api/axios';

export const initiatePayment = async (order_id, method) => {
  try {
    const response = await axiosInstance.post('/v1/payments/initiate', { order_id, method });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const initiateSubscriptionPayment = async (subscription_id, method) => {
  try {
    const response = await axiosInstance.post('/v1/payments/subscription', { subscription_id, method });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getPaymentByOrder = async (order_id) => {
  try {
    const response = await axiosInstance.get(`/v1/payments/${order_id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// Simulate the Edahabia webhook for testing
export const simulateEdahabiaWebhook = async (edahabia_ref, status = "success") => {
  try {
    // Normal payment webhook
    const response = await axiosInstance.post('/v1/payments/webhook', { edahabia_ref, status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const simulateSubscriptionPaymentWebhook = async (edahabia_ref, status = "success") => {
  try {
    const response = await axiosInstance.post('/v1/payments/subscription/webhook', { edahabia_ref, status });
    return response.data;
  } catch (error) {
    throw error;
  }
};
