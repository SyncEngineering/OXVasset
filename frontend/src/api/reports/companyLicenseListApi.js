import axiosInstance from '../axiosInstance';

export const getReport = (params) => axiosInstance.get('/reports/company-license-list', { params }).then(res => res.data);

export const exportXL = async (params) => {
  const response = await axiosInstance.get('/reports/company-license-list/export', {
    params,
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Company_License_List.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
