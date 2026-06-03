import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-disposal').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-disposal/${id}`).then(res => res.data);
export const getAssetOptions = () => axiosInstance.get('/asset-disposal/asset-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-disposal', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-disposal/${id}`, data).then(res => res.data);
export const approve = (id, action) => axiosInstance.patch(`/asset-disposal/${id}/approve`, { action }).then(res => res.data);
