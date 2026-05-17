import axiosInstance from '../api/axios';

export const getUserVehicles = async () => {
  try {
    const response = await axiosInstance.get('/vehicles');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

export const createVehicle = async (vehicleData) => {
  try {
    const response = await axiosInstance.post('/vehicles', vehicleData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    throw error;
  }
};

export const getBrands = async () => {
  try {
    const response = await axiosInstance.get('/brands');
    // Assuming it returns { brands: [...] } or { data: [...] }
    return response.data.data || response.data.brands || response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};

export const getModelsByBrand = async (brandId) => {
  try {
    const response = await axiosInstance.get(`/brands/${brandId}/models`);
    return response.data.data || response.data.models || response.data;
  } catch (error) {
    console.error('Error fetching models for brand:', error);
    throw error;
  }
};
