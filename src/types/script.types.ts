export interface ScriptItem {
  scriptName: string;
  scriptUrl: string;
  [key: string]: any;
}

export interface ScriptParams {
  startDate: number;
  endDate: number;
  projectUuids: string[];
  dataSourceUuids: string[];
  limit?: number;
  page?: number;
}

export interface ScriptQueryParams {
  name?: string;
  url?: string;
}

export interface ScriptResponse {
  items: ScriptItem[];
  totalCount: number;
}