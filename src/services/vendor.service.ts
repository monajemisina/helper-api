import axios from 'axios';

interface VendorParams {
  startDate: number;
  endDate: number;
  projectUuids: string[];
  dataSourceUuids: string[];
  categories?: string[];
}

export const fetchAllVendors = async (params: VendorParams): Promise<any> => {
  
  const response = await axios.get(`${process.env.FEROOT_API_VENDOR_URL}`, {
    params,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.FEROOT_API_KEY || '',
    },
  });

  return response.data;
};
