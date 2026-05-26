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

export const updateMyProfessionalProfile = async (payload) => {
  try {
    let response;
    if (payload instanceof FormData) {
      response = await axiosInstance.put('/users/me/professional-profile', payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      response = await axiosInstance.put('/users/me/professional-profile', payload);
    }
    return response.data.user;
  } catch (error) {
    console.error('Error updating professional profile:', error);
    throw error;
  }
};

export const deleteMyAccount = async () => {
  try {
    const response = await axiosInstance.delete('/users/me');
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};
