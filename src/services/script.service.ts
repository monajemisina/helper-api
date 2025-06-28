import { ScriptParams, ScriptResponse } from '../types/script.types';
import apiClient from '../utils/apiClient';

export const fetchAllScripts = async (params: ScriptParams): Promise<ScriptResponse> => {
  const response = await apiClient.get<ScriptResponse>('/scripts', { params });
  const { items, totalCount } = response.data;
  return {
    items: items,
    totalCount,
  };
};
