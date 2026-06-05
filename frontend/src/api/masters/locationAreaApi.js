import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/locations').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/locations/${id}`).then(res => res.data);
export const create = (data) => axiosInstance.post('/locations', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/locations/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/locations/${id}/toggle-active`).then(res => res.data);
export const remove = (id) => axiosInstance.delete(`/location-areas/${id}`).then(res => res.data);
