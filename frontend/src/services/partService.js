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

export const getPartById = async (id) => {
  try {
    const response = await axiosInstance.get(`/parts/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching part ${id}:`, error);
    throw error;
  }
};
