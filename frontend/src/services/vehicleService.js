import axiosInstance from "../api/axios";

export const getUserVehicles = async () => {
  try {
    const response = await axiosInstance.get("/vehicles");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    throw error;
  }
};

export const getVehicleById = async (vehicleId) => {
  try {
    const response = await axiosInstance.get(`/vehicles/${vehicleId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    throw error;
  }
};

// ✅ UPDATED: Accept optional imageFile parameter
export const createVehicle = async (vehicleData, imageFile = null) => {
  try {
    let payload = vehicleData;
    let config = {};

    // If image provided, use FormData for multipart upload
    if (imageFile) {
      const formData = new FormData();

      // Append all vehicle data fields
      Object.keys(vehicleData).forEach((key) => {
        if (vehicleData[key] !== undefined && vehicleData[key] !== null) {
          formData.append(key, vehicleData[key]);
        }
      });

      // Append image file - 'image' must match upload.fields() in backend routes
      formData.append("image", imageFile);

      payload = formData;
      // Let browser set Content-Type automatically with multipart boundary
      config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
    }

    const response = await axiosInstance.post("/vehicles", payload, config);
    return response.data.data;
  } catch (error) {
    console.error("Error creating vehicle:", error);
    throw error;
  }
};

// ✅ UPDATED: Accept optional imageFile parameter
export const updateVehicle = async (
  vehicleId,
  vehicleData,
  imageFile = null,
) => {
  try {
    let payload = vehicleData;
    let config = {};

    // If image provided, use FormData for multipart upload
    if (imageFile) {
      const formData = new FormData();

      // Append all vehicle data fields
      Object.keys(vehicleData).forEach((key) => {
        if (vehicleData[key] !== undefined && vehicleData[key] !== null) {
          formData.append(key, vehicleData[key]);
        }
      });

      // Append image file - 'image' must match upload.fields() in backend routes
      formData.append("image", imageFile);

      payload = formData;
      config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
    }

    const response = await axiosInstance.patch(
      `/vehicles/${vehicleId}`,
      payload,
      config,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    const response = await axiosInstance.delete(`/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};

export const getBrands = async () => {
  try {
    const response = await axiosInstance.get("/brands");
    return response.data.data || response.data.brands || response.data;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};

export const getModelsByBrand = async (brandId) => {
  try {
    const response = await axiosInstance.get(`/brands/${brandId}/models`);
    return response.data.data || response.data.models || response.data;
  } catch (error) {
    console.error("Error fetching models for brand:", error);
    throw error;
  }
};
