import apiClient from '../utils/apiClient';
import crypto from 'crypto';
import {
  Policy,
  DataAssetItem,
  UpdateAllowedUrlSourcesParams,
  UpdateAllowedVendorsParams,
} from '../types/policy.types';


const fetchRulePolicy = async (policyId: string): Promise<Policy> => {
  if (!policyId) {
    throw { status: 400, message: 'policyId is required' };
  }
  const resp = await apiClient.get<Policy>(`/policies/${policyId}`);
  return resp.data;
};

const updateAllowedUrlSources = async (
  params: UpdateAllowedUrlSourcesParams
): Promise<Policy> => {
  const { policyId, dataAssetType, allowedUrlSources } = params;
  const current = await fetchRulePolicy(policyId);

  const issueRules = current.issueRules || {};
  const uda = issueRules['unauthorized-data-access'] || { enabled: true, list: [] };
  const list = uda.list || [];

  const idx = list.findIndex(item => item.dataAssetType === dataAssetType);

  const newItem: DataAssetItem = idx === -1
    ? {
      id: crypto.randomUUID(),
      dataAssetType,
      allowedUrlSources,
      allowedVendors: {
        inherit: true,
        list: [],
        scope: { presence: false, read: false, transfer: false },
      },
    }
    : { ...list[idx], allowedUrlSources };

  const updatedList = idx === -1
    ? [...list, newItem]
    : list.map((it, i) => (i === idx ? newItem : it));

  const payload: Policy = {
    ...current,
    issueRules: {
      ...issueRules,
      'unauthorized-data-access': {
        ...uda,
        list: updatedList,
      },
    },
  };

  const resp = await apiClient.put<Policy>(`/policies/${policyId}`, payload);
  return resp.data;
};

const updateAllowedVendors = async (
  params: UpdateAllowedVendorsParams
): Promise<Policy> => {
  const { policyId, dataAssetType, allowedVendors } = params;
  const current = await fetchRulePolicy(policyId);

  const issueRules = current.issueRules || {};
  const uda = issueRules['unauthorized-data-access'] || { enabled: true, list: [] };
  const list = uda.list || [];

  const idx = list.findIndex(item => item.dataAssetType === dataAssetType);

  const newItem: DataAssetItem = idx === -1
    ? {
      id: crypto.randomUUID(),
      dataAssetType,
      allowedUrlSources: {
        inherit: true,
        list: [],
        scope: { presence: false, read: false, transfer: false },
      },
      allowedVendors,
    }
    : { ...list[idx], allowedVendors };

  const updatedList = idx === -1
    ? [...list, newItem]
    : list.map((it, i) => (i === idx ? newItem : it));

  const payload: Policy = {
    ...current,
    issueRules: {
      ...issueRules,
      'unauthorized-data-access': {
        ...uda,
        list: updatedList,
      },
    },
  };

  const resp = await apiClient.put<Policy>(`/policies/${policyId}`, payload);
  return resp.data;
};

const removeUnauthorizedScripts = async (
  policyId: string,
  urlPatternToRemove: string
): Promise<Policy> => {
  const { data: current } = await apiClient.get<Policy>(`/policies/${policyId}`);
  const issueRules = current.issueRules || {};

  const unauthorizedScriptsRule = issueRules['unauthorized-scripts'] || {
    enabled: true,
    inherit: true,
    list: [] as DataAssetItem[],
  };

  const exists = unauthorizedScriptsRule.list.some(item => item.urlPattern === urlPatternToRemove);


  if (!exists) {
    throw new Error(`No unauthorized script with pattern "${urlPatternToRemove}" found.`);
  }

  const filteredList = unauthorizedScriptsRule.list.filter(
    item => item.urlPattern !== urlPatternToRemove
  );
  const payload: Policy = {
    ...current,
    issueRules: {
      ...issueRules,
      'unauthorized-scripts': {
        ...unauthorizedScriptsRule,
        list: filteredList,
      },
    },
  };

  const { data: updated } = await apiClient.put<Policy>(
    `/policies/${policyId}`,
    payload
  );
  return updated;
};

const removeUnauthorizedScriptsByKeyword = async (
  policyId: string,
  keywordOrMatcher: string | ((url: string) => boolean)
): Promise<Policy> => {
  const { data: current } = await apiClient.get<Policy>(`/policies/${policyId}`);
  const issueRules = current.issueRules || {};

  const unauthorizedScriptsRule = issueRules['unauthorized-scripts'] || {
    enabled: true,
    inherit: true,
    list: [] as DataAssetItem[],
  };

  const matcher =
    typeof keywordOrMatcher === 'string'
      ? (url: string) => url.includes(keywordOrMatcher)
      : keywordOrMatcher;

  const originalList = unauthorizedScriptsRule.list;
  const filteredList = originalList.filter((item: any) => !matcher(item.urlPattern));

  if (filteredList.length === originalList.length) {
    throw new Error(`No unauthorized scripts matched the keyword.`);
  }

  const payload: Policy = {
    ...current,
    issueRules: {
      ...issueRules,
      'unauthorized-scripts': {
        ...unauthorizedScriptsRule,
        list: filteredList,
      },
    },
  };

  const { data: updated } = await apiClient.put<Policy>(
    `/policies/${policyId}`,
    payload
  );

  return updated;
};

export {
  fetchRulePolicy,
  updateAllowedUrlSources,
  updateAllowedVendors,
  removeUnauthorizedScripts,
  removeUnauthorizedScriptsByKeyword
};
