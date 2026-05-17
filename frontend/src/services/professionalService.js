import axiosInstance from '../api/axios';

/**
 * Get all professionals
 */
export const getAllProfessionals = async () => {
  try {
    const response = await axiosInstance.get('/professionals');
    return response.data.professionals;
  } catch (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
};

/**
 * Get a single professional by their user ID (returns the full user + professional_profile)
 */
export const getProfessionalById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error(`Error fetching professional ${id}:`, error);
    throw error;
  }
};
