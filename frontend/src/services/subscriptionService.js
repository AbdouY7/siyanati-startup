import axiosInstance from '../api/axios';

export const getSubscriptionPlans = async () => {
  try {
    const response = await axiosInstance.get('/subscription-plans');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionPlanById = async (id) => {
  try {
    const response = await axiosInstance.get(`/subscription-plans/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const createSubscriptionPlan = async (data) => {
  try {
    const response = await axiosInstance.post('/subscription-plans', data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateSubscriptionPlan = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/subscription-plans/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteSubscriptionPlan = async (id) => {
  try {
    const response = await axiosInstance.delete(`/subscription-plans/${id}`);
    return response.data.message;
  } catch (error) {
    throw error;
  }
};

export const createSubscription = async (plan_id) => {
  try {
    const response = await axiosInstance.post('/subscriptions', { plan_id });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getMySubscriptions = async () => {
  try {
    const response = await axiosInstance.get('/subscriptions/my');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getMyActiveSubscription = async () => {
  try {
    const response = await axiosInstance.get('/subscriptions/my/active');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getAllSubscriptions = async () => {
  try {
    const response = await axiosInstance.get('/subscriptions');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getSubscriptionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/subscriptions/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const cancelSubscription = async () => {
  try {
    const response = await axiosInstance.post('/subscriptions/my/cancel');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const suspendSubscription = async (id) => {
  try {
    const response = await axiosInstance.post(`/subscriptions/${id}/suspend`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const reactivateSubscription = async (id) => {
  try {
    const response = await axiosInstance.post(`/subscriptions/${id}/reactivate`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getPlatformSettings = async () => {
  try {
    const response = await axiosInstance.get('/platform-settings');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updatePlatformSetting = async (key, value, description) => {
  try {
    const response = await axiosInstance.put(`/platform-settings/${key}`, { value, description });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};
