import axiosInstance from '../api/axios';

export const getAppointmentHistory = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/appointments', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching appointment history:', error);
    throw error;
  }
};

export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await axiosInstance.get(`/appointments/${appointmentId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const confirmAppointment = async (appointmentId, confirmData) => {
  try {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/confirm`, confirmData);
    return response.data.data;
  } catch (error) {
    console.error('Error confirming appointment:', error);
    throw error;
  }
};

export const startAppointment = async (appointmentId) => {
  try {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/start`);
    return response.data.data;
  } catch (error) {
    console.error('Error starting appointment:', error);
    throw error;
  }
};

export const completeAppointment = async (appointmentId, completeData) => {
  try {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/complete`, completeData);
    return response.data.data;
  } catch (error) {
    console.error('Error completing appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId, cancelData = {}) => {
  try {
    const response = await axiosInstance.patch(`/appointments/${appointmentId}/cancel`, cancelData);
    return response.data.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};