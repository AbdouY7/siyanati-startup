import axiosInstance from '../api/axios';

export const getAllProfessionalsAdmin = async () => {
  try {
    const response = await axiosInstance.get('/professionals');
    return response.data.professionals;
  } catch (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
};

export const getProfessionalDetailsAdmin = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching professional details:', error);
    throw error;
  }
};

export const approveProfessional = async (profileId) => {
  try {
    const response = await axiosInstance.put(`/admin/approve/professional-registration/${profileId}`);
    return response.data;
  } catch (error) {
    console.error('Error approving professional:', error);
    throw error;
  }
};

export const rejectProfessional = async (profileId, rejection_reason) => {
  try {
    const response = await axiosInstance.put(`/admin/reject/professional-registration/${profileId}`, {
      rejection_reason
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting professional:', error);
    throw error;
  }
};

export const getDashboardOverview = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard/overview');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

export const getAllClientsAdmin = async () => {
  try {
    const response = await axiosInstance.get('/clients');
    return response.data.clients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const getClientDetailsAdmin = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
};

export const getAllStoresAdmin = async () => {
  try {
    const response = await axiosInstance.get('/shops');
    return response.data.stores;
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

export const getStoreDetailsAdmin = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching store details:', error);
    throw error;
  }
};

export const approveStore = async (profileId) => {
  try {
    const response = await axiosInstance.put(`/admin/approve/store-registration/${profileId}`);
    return response.data;
  } catch (error) {
    console.error('Error approving store:', error);
    throw error;
  }
};

export const rejectStore = async (profileId, rejection_reason) => {
  try {
    const response = await axiosInstance.put(`/admin/reject/store-registration/${profileId}`, {
      rejection_reason
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting store:', error);
    throw error;
  }
};
