import axiosInstance from '../axiosInstance';

export const getReport = (params) => axiosInstance.get('/reports/asset-summary-depreciation', { params }).then(res => res.data);
