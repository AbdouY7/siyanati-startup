import axiosInstance from '../api/axios';

export const getAllProfessionalsAdmin = async () => {
  try {
    const response = await axiosInstance.get('/admin/professionals');
    return response.data.professionals;
  } catch (error) {
    console.error('Error fetching professionals:', error);
    throw error;
  }
};

export const getProfessionalDetailsAdmin = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching professional details:', error);
    throw error;
  }
};

export const approveProfessional = async (profileId) => {
  try {
    const response = await axiosInstance.put(`/admin/approve/professional-registration/${profileId}`);
    return response.data;
  } catch (error) {
    console.error('Error approving professional:', error);
    throw error;
  }
};

export const rejectProfessional = async (profileId, rejection_reason) => {
  try {
    const response = await axiosInstance.put(`/admin/reject/professional-registration/${profileId}`, {
      rejection_reason
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting professional:', error);
    throw error;
  }
};

export const getDashboardOverview = async () => {
  try {
    const response = await axiosInstance.get('/admin/dashboard/overview');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

export const getAllClientsAdmin = async () => {
  try {
    const response = await axiosInstance.get('/clients');
    return response.data.clients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const getClientDetailsAdmin = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching client details:', error);
    throw error;
  }
};

export const getAllStoresAdmin = async () => {
  try {
    const response = await axiosInstance.get('/admin/stores');
    return response.data.stores;
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

export const getStoreDetailsAdmin = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching store details:', error);
    throw error;
  }
};

export const approveStore = async (profileId) => {
  try {
    const response = await axiosInstance.put(`/admin/approve/store-registration/${profileId}`);
    return response.data;
  } catch (error) {
    console.error('Error approving store:', error);
    throw error;
  }
};

export const rejectStore = async (profileId, rejection_reason) => {
  try {
    const response = await axiosInstance.put(`/admin/reject/store-registration/${profileId}`, {
      rejection_reason
    });
    return response.data;
  } catch (error) {
    console.error('Error rejecting store:', error);
    throw error;
  }
};

export const updateUserStatusAdmin = async (userId, is_active) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${userId}/status`, {
      is_active,
    });
    return response.data.user;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const openAdminDocument = async (documentPath) => {
  if (!documentPath) return;

  if (/^https?:\/\//i.test(documentPath)) {
    // Proxy Cloudinary URLs through backend to avoid tracking prevention
    if (documentPath.includes("cloudinary.com")) {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
      const proxyUrl = `${apiBase}/proxy/image?url=${encodeURIComponent(documentPath)}`;
      window.open(proxyUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open(documentPath, "_blank", "noopener,noreferrer");
    }
    return;
  }

  const popup = window.open("", "_blank", "noopener,noreferrer");

  try {
    const response = await axiosInstance.get("/admin/documents/view", {
      params: { path: documentPath },
      responseType: "blob",
    });

    const blobUrl = window.URL.createObjectURL(response.data);

    if (popup) {
      popup.location.href = blobUrl;
    } else {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60 * 1000);
  } catch (error) {
    if (popup) popup.close();
    console.error("Error opening admin document:", error);
    window.alert(
      error.response?.data?.message ||
        "Impossible d'ouvrir ce document. Le fichier est introuvable ou inaccessible.",
    );
    throw error;
  }
};
