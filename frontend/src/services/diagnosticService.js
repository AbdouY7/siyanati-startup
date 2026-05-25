import axiosInstance from "../api/axios";

export const getDiagnosticPosts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/diagnostic", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching diagnostic posts:", error);
    throw error;
  }
};

export const getUserPublications = async () => {
  try {
    const response = await axiosInstance.get("/diagnostic/user/me");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user publications:", error);
    throw error;
  }
};

export const createDiagnosticPost = async (postData) => {
  try {
    const isFormData = postData instanceof FormData;
    const response = await axiosInstance.post("/diagnostic", postData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error creating diagnostic post:", error);
    throw error;
  }
};

export const updateDiagnosticPost = async (postId, postData) => {
  try {
    const isFormData = postData instanceof FormData;
    const response = await axiosInstance.patch(`/diagnostic/${postId}`, postData, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error updating diagnostic post:", error);
    throw error;
  }
};

export const deleteDiagnosticPost = async (postId) => {
  try {
    const response = await axiosInstance.delete(`/diagnostic/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting diagnostic post:", error);
    throw error;
  }
};

export const toggleSavePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/diagnostic/${postId}/save`);
    return response.data;
  } catch (error) {
    console.error("Error toggling save:", error);
    throw error;
  }
};

export const toggleReaction = async (postId) => {
  try {
    const response = await axiosInstance.post(`/diagnostic/${postId}/react`);
    return response.data;
  } catch (error) {
    console.error("Error toggling reaction:", error);
    throw error;
  }
};

export const getSavedDiagnosticPosts = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/diagnostic/saved", { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching saved diagnostic posts:", error);
    throw error;
  }
};

export const getDiagnosticPostById = async (postId) => {
  try {
    const response = await axiosInstance.get(`/diagnostic/${postId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching diagnostic post details:", error);
    throw error;
  }
};

export const getPostComments = async (postId, params = {}) => {
  try {
    const response = await axiosInstance.get(`/diagnostic/${postId}/comments`, { params });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const createPostComment = async (postId, commentData) => {
  try {
    const response = await axiosInstance.post(`/diagnostic/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};
