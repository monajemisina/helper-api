import apiClient from '../utils/apiClient';

const fetchDashboard = async (
  params: any
): Promise<any> => {
  const response = await apiClient.get<any>('/dashboard', { params });
  return response.data;
};

export { fetchDashboard }