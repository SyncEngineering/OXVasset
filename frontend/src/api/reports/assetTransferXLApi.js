import axiosInstance from '../axiosInstance';

export const exportXL = async (params) => {
  const response = await axiosInstance.get('/reports/asset-transfer-xl', {
    params,
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Asset_Transfers.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};
