import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-sub-types').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-sub-types/${id}`).then(res => res.data);
export const getParentOptions = () => axiosInstance.get('/asset-sub-types/parent-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-sub-types', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-sub-types/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/asset-sub-types/${id}/toggle-active`).then(res => res.data);
export const remove = (id) => axiosInstance.delete(`/asset-sub-types/${id}`).then(res => res.data);
