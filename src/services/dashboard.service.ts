import axios from 'axios';

interface DashboardParams {
projectUuids: string[];
  dataSourceUuids: string[];
  startDate: number;
  endDate: number;
  categories?: string[];
}

export const fetchDashboard = async (params: DashboardParams): Promise<any> => {
  const dashboardApi = process.env.FEROOT_API_DASH_URL as string;
  if (!dashboardApi) {
    throw new Error("FEROOT_API_DASH_URL is not defined in environment variables");
  }
  const response = await axios.get(dashboardApi, {
    params,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.FEROOT_API_KEY || '',
    },
  });

  return response.data;
};
