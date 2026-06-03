import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/odometer-resets').then(res => res.data);
export const getAssetOptions = () => axiosInstance.get('/odometer-resets/asset-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/odometer-resets', data).then(res => res.data);
