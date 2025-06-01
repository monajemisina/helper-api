import axios from 'axios';

interface ScriptParams {
  startDate: number;
  endDate: number;
  projectUuids: string[];
  dataSourceUuids: string[];
  limit?: number;
  page?: number;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  categories?: string[];
  search?: string;
}

export const fetchAllScripts = async (params: ScriptParams): Promise<any> => {
  
  const response = await axios.get(`${process.env.FEROOT_API_SCRIPT_URL}`, {
    params,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.FEROOT_API_KEY || '',
    },
  });

  return response.data;
};
