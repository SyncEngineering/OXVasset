import axiosInstance from '../axiosInstance';

export const getAll = () => axiosInstance.get('/depreciation-entries').then(res => res.data);
export const getById = (id) => axiosInstance.get(`/depreciation-entries/${id}`).then(res => res.data);
export const getAssetOptions = () => axiosInstance.get('/depreciation-entries/asset-options').then(res => res.data);
export const create = (data) => axiosInstance.post('/depreciation-entries', data).then(res => res.data);
export const update = (id, data) => axiosInstance.put(`/depreciation-entries/${id}`, data).then(res => res.data);
export const postEntry = (id) => axiosInstance.patch(`/depreciation-entries/${id}/post`).then(res => res.data);
export const reverseEntry = (id) => axiosInstance.patch(`/depreciation-entries/${id}/reverse`).then(res => res.data);
