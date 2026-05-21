import axiosInstance from "../api/axios";

const scheduleBasePath = (professionalId) =>
  `/professionals/${professionalId || "me"}/schedule`;

export const getProfessionalSchedule = async (professionalId) => {
  const response = await axiosInstance.get(scheduleBasePath(professionalId));
  return response.data.data;
};

export const saveWeeklySchedule = async (professionalId, schedules) => {
  const response = await axiosInstance.put(scheduleBasePath(professionalId), {
    schedules,
  });
  return response.data.data;
};

export const addScheduleException = async (professionalId, payload) => {
  const response = await axiosInstance.post(
    `${scheduleBasePath(professionalId)}/exceptions`,
    payload,
  );
  return response.data.data;
};

export const deleteScheduleException = async (professionalId, exceptionId) => {
  const response = await axiosInstance.delete(
    `${scheduleBasePath(professionalId)}/exceptions/${exceptionId}`,
  );
  return response.data.data;
};
