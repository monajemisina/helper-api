export interface DashboardHistoryEntry {
  timestamp: number;
  value: number;
}

export interface DashboardSection {
  total: number;
  history: DashboardHistoryEntry[];
  [key: string]: any;
}

export interface DashboardResponse {
  pages: DashboardSection;
  vendors: DashboardSection;
  scripts: DashboardSection;
  cookies: DashboardSection;
  issues: DashboardSection;
  dataAssets: DashboardSection;
  screenshotUrl?: string;
}

export interface DashboardParams {
  startDate: number;
  endDate: number;
  projectUuids: string[];
  dataSourceUuids: string[];
  timezoneOffset: number;
}

