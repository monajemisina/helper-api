import apiClient from '../utils/apiClient';

const fetchAllVendors = async (params: any): Promise<any> => {
  const response = await apiClient.get<any>('/vendors', { params });
  const { vendors, stats } = response.data;
  return {
    vendors,
    stats,
  };
};





export {fetchAllVendors}