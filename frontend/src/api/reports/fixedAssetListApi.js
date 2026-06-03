import axiosInstance from '../axiosInstance';

export const getReport = (params) => axiosInstance.get('/reports/fixed-asset-list', { params }).then(res => res.data);
