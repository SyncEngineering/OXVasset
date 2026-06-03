import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/common-doc-types').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/common-doc-types/${id}`).then(res => res.data);
export const create = (data) => axiosInstance.post('/common-doc-types', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/common-doc-types/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/common-doc-types/${id}/toggle-active`).then(res => res.data);
