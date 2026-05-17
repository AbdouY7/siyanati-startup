import axiosInstance from '../api/axios';

export const getUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    // Assuming backend has a PUT/PATCH /users/:id or similar
    // Since we didn't confirm the exact update route, we might need to adjust this.
    // For now, making a standard PUT request.
    const response = await axiosInstance.put(`/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
