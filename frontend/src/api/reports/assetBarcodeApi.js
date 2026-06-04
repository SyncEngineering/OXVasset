import axiosInstance from '../axiosInstance';

/**
 * Fetch asset data for barcode generation.
 */
export const getAssets = async (params) => {
  const response = await axiosInstance.get('/reports/asset-barcode', { params });
  return response.data;
};
