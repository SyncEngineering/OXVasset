import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/assets').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/assets/${id}`).then(res => res.data);
export const getDropdownOptions = () => axiosInstance.get('/assets/dropdown-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/assets', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/assets/${id}`, data).then(res => res.data);
export const updateStatus = (id, status) => axiosInstance.patch(`/assets/${id}/status`, { asset_status: status }).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/assets/${id}/toggle-active`).then(res => res.data);
