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
  const scriptApi = process.env.FEROOT_API_SCRIPT_URL as string;
  if (!scriptApi) {
    throw new Error("FEROOT_API_SCRIPT_URL is not defined in environment variables");
  }
  const response = await axios.get(scriptApi, {
    params,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.FEROOT_API_KEY || '',
    },
  });

  return response.data;
};