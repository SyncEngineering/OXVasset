import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-types').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-types/${id}`).then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-types', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-types/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/asset-types/${id}/toggle-active`).then(res => res.data);
