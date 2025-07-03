export interface DashboardParams {
  startDate: number;
  endDate: number;
  timezoneOffset: number;
}

export interface DashboardData {
  scripts: any[];
  cookies: any[];
  dataAssets: any[];
  issues: any[];
  screenshotUrl: string;
}