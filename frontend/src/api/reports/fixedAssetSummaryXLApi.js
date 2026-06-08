import axiosInstance from '../axiosInstance';

export const exportXL = async (params) => {
  const response = await axiosInstance.get('/reports/fixed-asset-summary-xl', {
    params,
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'KSRTC_Asset_Register.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
