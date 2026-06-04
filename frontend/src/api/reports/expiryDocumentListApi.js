import axiosInstance from '../axiosInstance';

/**
 * Fetch consolidated expiry document report.
 */
export const getReport = async (params) => {
  const response = await axiosInstance.get('/reports/expiry-document-list', { params });
  return response.data;
};
