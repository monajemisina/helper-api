import apiClient from '../utils/apiClient';
import crypto from 'crypto';
import {
  Policy,
  DataAssetItem,
  UpdateAllowedUrlSourcesParams,
  UpdateAllowedVendorsParams,
} from '../types/policy.types';


const fetchRulePolicy = async (ruleId: string): Promise<Policy> => {
  if (!ruleId) {
    throw { status: 400, message: 'ruleId is required' };
  }
  const resp = await apiClient.get<Policy>(`/policies/${ruleId}`);
  return resp.data;
};

const updateAllowedUrlSources = async (
  params: UpdateAllowedUrlSourcesParams
): Promise<Policy> => {
  const { ruleId, dataAssetType, allowedUrlSources } = params;
  const current = await fetchRulePolicy(ruleId);

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

  const resp = await apiClient.put<Policy>(`/policies/${ruleId}`, payload);
  return resp.data;
};

const updateAllowedVendors = async (
  params: UpdateAllowedVendorsParams
): Promise<Policy> => {
  const { ruleId, dataAssetType, allowedVendors } = params;
  const current = await fetchRulePolicy(ruleId);

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

  const resp = await apiClient.put<Policy>(`/policies/${ruleId}`, payload);
  return resp.data;
};

const removeUnauthorizedScripts = async (
  ruleId: string,
  urlPatternToRemove: string
): Promise<Policy> => {
  const { data: current } = await apiClient.get<Policy>(`/policies/${ruleId}`);
  const issueRules = current.issueRules || {};

  const us = issueRules['unauthorized-scripts'] || {
    enabled: true,
    inherit: true,
    list: [] as DataAssetItem[],
  };
  const filteredList = us.list.filter(
    item => item.urlPattern !== urlPatternToRemove
  );

  // 4. build updated payload
  const payload: Policy = {
    ...current,
    issueRules: {
      ...issueRules,
      'unauthorized-scripts': {
        ...us,
        list: filteredList,
      },
    },
  };

  const { data: updated } = await apiClient.put<Policy>(
    `/policies/${ruleId}`,
    payload
  );
  return updated;
};
export {
  fetchRulePolicy,
  updateAllowedUrlSources,
  updateAllowedVendors,
  removeUnauthorizedScripts
};
