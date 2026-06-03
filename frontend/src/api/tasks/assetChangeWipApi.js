import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-change-wip').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-change-wip/${id}`).then(res => res.data);
export const getAssetOptions = () => axiosInstance.get('/asset-change-wip/asset-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-change-wip', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-change-wip/${id}`, data).then(res => res.data);
export const approve = (id, action) => axiosInstance.patch(`/asset-change-wip/${id}/approve`, { action }).then(res => res.data);
