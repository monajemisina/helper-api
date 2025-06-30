import apiClient from '../utils/apiClient';

const fetchAllScripts = async (params: any): Promise<any> => {
  const response = await apiClient.get<any>('/scripts', { params });
  const { items, totalCount } = response.data;
  return {
    items: items,
    totalCount,
  };
};

export { fetchAllScripts };