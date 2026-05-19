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
    // Use FormData to support file uploads (profilePicture)
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // If it's a File object (profile picture), append it directly
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value);
        }
      }
    });

    const response = await axiosInstance.put(`/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
