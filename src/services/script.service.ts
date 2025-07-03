import apiClient from '../utils/apiClient';

const fetchAllScripts = async (params: any): Promise<any> => {
  const { page = 1, pageSize = 10, ...restParams } = params;
  const response = await apiClient.get<any>('/scripts', {
    params: {
      ...restParams,
      page,
      limit: pageSize,
    },
  });

  const { items, totalCount } = response.data;
  return {
    items,
    totalCount,
    page,
    pageSize,
  };
};


export { fetchAllScripts };