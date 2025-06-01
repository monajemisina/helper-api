import axios from 'axios';
import apiClient from '../utils/apiClient';

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
  const response = await apiClient.get('/scripts', { params });
  return response.data;
};