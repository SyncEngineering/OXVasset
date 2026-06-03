import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/company-licenses').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/company-licenses/${id}`).then(res => res.data);
export const getDocTypeOptions = () => axiosInstance.get('/company-licenses/doc-options').then(res => res.data);

export const create = (formData) => axiosInstance.post('/company-licenses', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const update = (id, formData) => axiosInstance.put(`/company-licenses/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const toggleActive = (id) => axiosInstance.patch(`/company-licenses/${id}/toggle-active`).then(res => res.data);
