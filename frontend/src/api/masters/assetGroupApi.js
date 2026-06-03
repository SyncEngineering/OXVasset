import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-groups').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-groups/${id}`).then(res => res.data);
export const getParentOptions = () => axiosInstance.get('/asset-groups/parent-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-groups', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-groups/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/asset-groups/${id}/toggle-active`).then(res => res.data);
