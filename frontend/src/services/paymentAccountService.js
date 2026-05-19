import axiosInstance from '../api/axios';

export const getUserPaymentAccounts = async () => {
  try {
    const response = await axiosInstance.get('/payment-accounts');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    throw error;
  }
};

export const createPaymentAccount = async (accountData) => {
  try {
    const response = await axiosInstance.post('/payment-accounts', accountData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating payment account:', error);
    throw error;
  }
};

export const updatePaymentAccount = async (accountId, accountData) => {
  try {
    const response = await axiosInstance.patch(`/payment-accounts/${accountId}`, accountData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating payment account:', error);
    throw error;
  }
};

export const deletePaymentAccount = async (accountId) => {
  try {
    const response = await axiosInstance.delete(`/payment-accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment account:', error);
    throw error;
  }
};