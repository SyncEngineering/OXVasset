import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-categories').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-categories/${id}`).then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-categories', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-categories/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/asset-categories/${id}/toggle-active`).then(res => res.data);
export const remove = (id) => axiosInstance.delete(`/asset-categories/${id}`).then(res => res.data);
