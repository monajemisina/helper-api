import { FindVendorsParams, FindVendorsResult, VendorItem, VendorStats } from '../types/vendor.types';
import apiClient from '../utils/apiClient';
import { extractFerootUuids } from '../utils/urlUuidExtractor';

const fetchAllVendors = async (opts: FindVendorsParams): Promise<FindVendorsResult> => {
  const sourceUrl = process.env.FEROOT_SOURCE_URL;
  if (!sourceUrl) {
    throw { status: 400, message: 'FEROOT_SOURCE_URL is not defined' };
  }

  const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);
  const params: Record<string, any> = {
    projectUuids: [projectUuid],
    startDate:    new Date('2025-05-31').getTime(),
    endDate:      Date.now(),
    page:         opts.page,
    limit:        opts.pageSize,
    ...(dataSourceUuid && { dataSourceUuids: [dataSourceUuid] }),
  };
  const { vendors, stats, totalCount } = await apiClient
    .get<{ vendors: VendorItem[]; stats: VendorStats; totalCount: number }>(
      '/vendors',
      { params }
    )
    .then(r => r.data);

  if (opts.name === 'all') {
    const ids = vendors.map(v => v.id);
    return {
      page:       opts.page,
      pageSize:   opts.pageSize,
      totalCount,
      vendors:    ids,
      vendorCount: ids.length,
    };
  } if (opts.name) {
    const filtered = vendors.filter(v =>
      v.id.toLowerCase().includes(opts.name!.toLowerCase())
    );
    return {
      page:       opts.page,
      pageSize:   opts.pageSize,
      totalCount,
      vendors:    filtered,
      stats,
      vendorCount: filtered.length,
    };
  }

  return {
    page:       opts.page,
    pageSize:   opts.pageSize,
    totalCount,
    vendors,
    stats,
  };
};

export { fetchAllVendors };
