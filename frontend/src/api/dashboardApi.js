import axiosInstance from './axiosInstance';

/**
 * Fetch dashboard statistics.
 */
export const getStats = async () => {
  const response = await axiosInstance.get('/dashboard/stats');
  return response.data;
};
