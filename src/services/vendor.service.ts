import apiClient from '../utils/apiClient';
import { VendorParams, VendorResponse} from '../types/vendor.types';

export const fetchAllVendors = async (params: VendorParams): Promise<VendorResponse> => {
  const response = await apiClient.get<VendorResponse>('/vendors', { params });
  const { vendors, stats } = response.data;
  return {
    vendors,
    stats,
  };
};
