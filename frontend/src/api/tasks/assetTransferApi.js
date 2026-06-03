import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-transfers').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-transfers/${id}`).then(res => res.data);
export const getAssetOptions = () => axiosInstance.get('/asset-transfers/asset-options').then(res => res.data);
export const getDivisionOptions = () => axiosInstance.get('/asset-transfers/division-options').then(res => res.data);
export const getLocationOptions = () => axiosInstance.get('/asset-transfers/location-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-transfers', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-transfers/${id}`, data).then(res => res.data);
export const approve = (id, action) => axiosInstance.patch(`/asset-transfers/${id}/approve`, { action }).then(res => res.data);
