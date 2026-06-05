import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-divisions').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-divisions/${id}`).then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-divisions', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-divisions/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/asset-divisions/${id}/toggle-active`).then(res => res.data);
export const remove = (id) => axiosInstance.delete(`/asset-divisions/${id}`).then(res => res.data);
