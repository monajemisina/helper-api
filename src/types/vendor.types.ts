export interface VendorItem {
  id: string;
  name: string;
  logoUrl?: string;
  type?: string;
  category?: string;
  source?: string;
  [key: string]: any;
}

export interface VendorParams {
  startDate: number;
  endDate: number;
  projectUuids: string[];
  dataSourceUuids: string[];
}

export interface VendorQueryParams {
  name?: string;
}

export interface VendorResponse {
  vendors: VendorItem[];
  stats?: any;
}
