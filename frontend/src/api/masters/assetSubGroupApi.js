import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-sub-groups').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-sub-groups/${id}`).then(res => res.data);
export const getParentOptions = () => axiosInstance.get('/asset-sub-groups/parent-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-sub-groups', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-sub-groups/${id}`, data).then(res => res.data);
export const toggleActive = (id) => axiosInstance.patch(`/asset-sub-groups/${id}/toggle-active`).then(res => res.data);
