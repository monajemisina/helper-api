import apiClient from '../utils/apiClient';
import { DashboardParams, DashboardResponse } from '../types/dashboard.types';

export const fetchDashboard = async (
  params: DashboardParams
): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>('/dashboard', { params });
  return response.data;
};
