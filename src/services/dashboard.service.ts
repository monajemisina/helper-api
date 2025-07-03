import { DashboardData, DashboardParams } from "../types/dashboard.types";
import apiClient from "../utils/apiClient";
import { extractFerootUuids } from "../utils/urlUuidExtractor";

const fetchDashboard = async (opts: DashboardParams): Promise<DashboardData> => {
  const sourceUrl = process.env.FEROOT_SOURCE_URL;
  if (!sourceUrl) {
    throw { status: 400, message: 'FEROOT_SOURCE_URL is not defined' };
  }

  const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);
  const params: Record<string, any> = {
    projectUuids:    [projectUuid],
    startDate:       opts.startDate,
    endDate:         opts.endDate,
    timezoneOffset:  opts.timezoneOffset,
    ...(dataSourceUuid && { dataSourceUuids: [dataSourceUuid] }),
  };

  const { data } = await apiClient.get<DashboardData>('/dashboard', { params });
  return data;
};

export { fetchDashboard };