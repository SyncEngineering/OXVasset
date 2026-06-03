import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/branch-transfers').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/branch-transfers/${id}`).then(res => res.data);
export const getAssetOptions = () => axiosInstance.get('/branch-transfers/asset-options').then(res => res.data);
export const getLocationOptions = () => axiosInstance.get('/branch-transfers/location-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/branch-transfers', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/branch-transfers/${id}`, data).then(res => res.data);
export const approve = (id, action) => axiosInstance.patch(`/branch-transfers/${id}/approve`, { action }).then(res => res.data);
