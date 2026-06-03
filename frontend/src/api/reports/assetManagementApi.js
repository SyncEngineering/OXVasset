import axiosInstance from '../axiosInstance';

export const getReport = (params) => axiosInstance.get('/reports/asset-management', { params }).then(res => res.data);
