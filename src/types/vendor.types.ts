export interface FindVendorsParams {
  name?: string;
  page: number;
  pageSize: number;
}

export interface VendorItem {
  id: string;
  // …other vendor fields…
}

export interface VendorStats {
  // …whatever stats shape the API returns…
  [key: string]: any;
}

export interface FindVendorsResult {
  page: number;
  pageSize: number;
  totalCount: number;
  vendors: VendorItem[] | string[];
  stats?: VendorStats;
  vendorCount?: number; // when returning just IDs
}