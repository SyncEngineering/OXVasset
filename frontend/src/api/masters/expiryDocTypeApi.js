import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/expiry-doc-types').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/expiry-doc-types/${id}`).then(res => res.data);
export const create = (data) => axiosInstance.post('/expiry-doc-types', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/expiry-doc-types/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/expiry-doc-types/${id}/toggle-active`).then(res => res.data);
