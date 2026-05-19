import axiosInstance from '../api/axios';

export const getFavorites = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/favorites', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const addFavorite = async (targetId, targetType) => {
  try {
    const response = await axiosInstance.post('/favorites', {
      target_id: targetId,
      target_type: targetType,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavorite = async (targetId, targetType) => {
  try {
    const response = await axiosInstance.delete(`/favorites/${targetId}/${targetType}`);
    return response.data;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

export const checkFavorite = async (targetId, targetType) => {
  try {
    const response = await axiosInstance.get(`/favorites/${targetId}/${targetType}/check`);
    return response.data.data;
  } catch (error) {
    console.error('Error checking favorite:', error);
    throw error;
  }
};
