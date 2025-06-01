import axios from 'axios';

interface DashboardParams {
projectUuids: string[];
  dataSourceUuids: string[];
  startDate: number;
  endDate: number;
  categories?: string[];
}

export const fetchDashboard = async (params: DashboardParams): Promise<any> => {
  
  const response = await axios.get(`${process.env.FEROOT_API_DASH_URL}`, {
    params,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.FEROOT_API_KEY || '',
    },
  });

  return response.data;
};
