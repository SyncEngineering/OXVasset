import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/asset-reclassify').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/asset-reclassify/${id}`).then(res => res.data);
export const getAssetOptions = () => axiosInstance.get('/asset-reclassify/asset-options').then(res => res.data);
export const getCategoryOptions = () => axiosInstance.get('/asset-reclassify/category-options').then(res => res.data);
export const getGroupOptions = () => axiosInstance.get('/asset-reclassify/group-options').then(res => res.data);
export const getSubGroupOptions = () => axiosInstance.get('/asset-reclassify/sub-group-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/asset-reclassify', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/asset-reclassify/${id}`, data).then(res => res.data);
export const approve = (id, action) => axiosInstance.patch(`/asset-reclassify/${id}/approve`, { action }).then(res => res.data);
