import axiosInstance from '../api/axios';

export const getDiagnosticPosts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/diagnostic', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching diagnostic posts:', error);
    throw error;
  }
};
