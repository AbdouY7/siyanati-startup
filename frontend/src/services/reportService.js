import axiosInstance from "../api/axios";

export const submitReport = async (reportData) => {
  const response = await axiosInstance.post("/reports", reportData);
  return response.data;
};

export const getAdminReports = async (params) => {
  const response = await axiosInstance.get("/reports", { params });
  return response.data.data;
};

export const updateReportStatus = async (id, data) => {
  const response = await axiosInstance.patch(`/reports/${id}`, data);
  return response.data.data;
};
