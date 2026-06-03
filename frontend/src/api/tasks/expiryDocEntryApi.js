import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/expiry-doc-entries').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/expiry-doc-entries/${id}`).then(res => res.data);
export const getAssetOptions = () => axiosInstance.get('/expiry-doc-entries/asset-options').then(res => res.data);
export const getDocTypeOptions = () => axiosInstance.get('/expiry-doc-entries/doc-options').then(res => res.data);

export const create = (formData) => axiosInstance.post('/expiry-doc-entries', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const update = (id, formData) => axiosInstance.put(`/expiry-doc-entries/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);

export const toggleActive = (id) => axiosInstance.patch(`/expiry-doc-entries/${id}/toggle-active`).then(res => res.data);
