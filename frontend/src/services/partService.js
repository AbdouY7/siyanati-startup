import axiosInstance from '../api/axios';

export const getAllParts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/parts', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching parts:', error);
    throw error;
  }
};

export const getMyParts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/parts/my', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching my parts:', error);
    throw error;
  }
};

export const getPartById = async (id) => {
  try {
    const response = await axiosInstance.get(`/parts/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching part ${id}:`, error);
    throw error;
  }
};

export const createPart = async (formData) => {
  try {
    const response = await axiosInstance.post('/parts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating part:', error);
    throw error;
  }
};

export const updatePart = async (id, formData) => {
  try {
    const response = await axiosInstance.patch(`/parts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating part:', error);
    throw error;
  }
};

export const deletePart = async (id) => {
  try {
    const response = await axiosInstance.delete(`/parts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting part:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories');
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCompatibility = async (data) => {
  try {
    const response = await axiosInstance.post('/compatibilities', data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating compatibility:', error);
    throw error;
  }
};

export const updateCompatibility = async (id, data) => {
  try {
    const response = await axiosInstance.patch(`/compatibilities/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating compatibility:', error);
    throw error;
  }
};

export const deleteCompatibility = async (id) => {
  try {
    const response = await axiosInstance.delete(`/compatibilities/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting compatibility:', error);
    throw error;
  }
};
