import axios from 'axios';

interface VendorParams {
  startDate: number;
  endDate: number;
  projectUuids: string[];
  dataSourceUuids: string[];
  categories?: string[];
}

export const fetchAllVendors = async (params: VendorParams): Promise<any> => {
  const vendorApi = process.env.FEROOT_API_VENDOR_URL as string
  if (!vendorApi) {
    throw new Error("FEROOT_API_VENDOR_URL is not defined in environment variables");
  }
  const response = await axios.get(vendorApi, {
    params,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.FEROOT_API_KEY || '',
    },
  });

  return response.data;
};
