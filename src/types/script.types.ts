export interface FindScriptsParams {
  name?: string;
  url?: string;
  page: number;
  pageSize: number;
}

export interface ScriptItem {
  scriptId: string;
  scriptName: string;
  scriptUrl: string;
  eventsCount: number;
  // …any other fields…
}

export interface FindScriptsResult {
  page: number;
  pageSize: number;
  totalCount: number;
  scripts: ScriptItem[] | string[];
  scriptCount?: number; 
}