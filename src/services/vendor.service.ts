import apiClient from '../utils/apiClient';

const fetchAllVendors = async (params: any): Promise<any> => {
  const { page = 1, pageSize = 50, ...restParams } = params;

  const response = await apiClient.get<any>('/vendors', {
    params: {
      ...restParams,
      page,
      limit: pageSize, 
    },
  });

  const { vendors, stats, totalCount } = response.data;

  return {
    vendors,
    stats,
    totalCount,
  };
};

export { fetchAllVendors };
