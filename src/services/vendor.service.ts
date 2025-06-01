import axios from 'axios';
import apiClient from '../utils/apiClient';

interface VendorParams {
  startDate: number;
  endDate: number;
  projectUuids: string[];
  dataSourceUuids: string[];
  categories?: string[];
}

export const fetchAllVendors = async (params: VendorParams): Promise<any> => {
  const response = await apiClient.get('/vendors', { params });
  return response.data;
};