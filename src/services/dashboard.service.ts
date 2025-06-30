import apiClient from '../utils/apiClient';
import { DashboardParams, DashboardResponse } from '../types/dashboard.types';

const fetchDashboard = async (
  params: DashboardParams
): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>('/dashboard', { params });
  return response.data;
};

export { fetchDashboard }