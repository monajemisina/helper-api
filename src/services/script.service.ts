import { FindScriptsParams, FindScriptsResult, ScriptItem } from '../types/script.types';
import apiClient from '../utils/apiClient';
import { extractFerootUuids } from '../utils/urlUuidExtractor';

const fetchAllScripts = async (opts: FindScriptsParams): Promise<FindScriptsResult> => {
  const sourceUrl = process.env.FEROOT_SOURCE_URL;
  if (!sourceUrl) {
    throw { status: 400, message: 'FEROOT_SOURCE_URL is not defined' };
  }

  const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);
  const params: Record<string, any> = {
    projectUuids: [projectUuid],
    startDate: new Date('2025-03-31').getTime(),
    endDate: Date.now(),
    page: opts.page,
    limit: opts.pageSize,
    ...(dataSourceUuid && { dataSourceUuids: [dataSourceUuid] }),
  };
  const { items, totalCount } = await apiClient
    .get<{ items: ScriptItem[]; totalCount: number }>('/scripts', { params })
    .then(r => r.data);

  let scripts: ScriptItem[] | string[] = items;
  let scriptCount: number | undefined;

  if (opts.name === 'all') {
  const names = Array.from(
    new Set(items.map(s => s.scriptName).filter(Boolean))
  );
  scripts = names;
  scriptCount = names.length;
} else if (opts.name) {
  const searchTerm = opts.name.toLowerCase();
  scripts = items.filter(s =>
    s.scriptName?.toLowerCase().includes(searchTerm)
  );
} else if (opts.url === 'all') {
  scripts = items.map(s => s.scriptUrl);
} else if (opts.url) {
  const searchUrl = opts.url.toLowerCase();
  scripts = items.filter(s =>
    s.scriptUrl?.toLowerCase().includes(searchUrl)
  );
}
  return {
    page: opts.page,
    pageSize: opts.pageSize,
    totalCount,
    scripts,
    scriptCount,
  };
};



export { fetchAllScripts };