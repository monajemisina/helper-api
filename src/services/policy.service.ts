import { Policy, AllowedUrlSources, AllowedVendors, DataAssetItem } from '../types/policy.types';
import apiClient from '../utils/apiClient';
import crypto from 'crypto';

const updateAllowedUrlSources = async (
  ruleId: string,
  dataAssetType: string,
  allowedUrlSources: AllowedUrlSources
): Promise<Policy> => {
  const { data: currentPolicy } = await apiClient.get<Policy>(`/policies/${ruleId}`);

  const issueRules = currentPolicy.issueRules || {};
  const unauthorizedDataAccess = issueRules["unauthorized-data-access"] || { enabled: true, list: [] };
  const list = unauthorizedDataAccess.list || [];

  const index = list.findIndex((item) => item.dataAssetType === dataAssetType);

  const updatedList =
    index !== -1
      ? list.map((item) =>
        item.dataAssetType === dataAssetType
          ? { ...item, allowedUrlSources }
          : item
      )
      : [
        ...list,
        {
          id: crypto.randomUUID(),
          dataAssetType,
          allowedUrlSources,
          allowedVendors: {
            inherit: true,
            list: [],
            scope: { presence: false, read: false, transfer: false },
          },
        } as DataAssetItem,
      ];

  const payload: Policy = {
    ...currentPolicy,
    issueRules: {
      ...issueRules,
      "unauthorized-data-access": {
        ...unauthorizedDataAccess,
        list: updatedList,
      },
    },
  };

  const response = await apiClient.put<Policy>(`/policies/${ruleId}`, payload);
  return response.data;
};

const updateAllowedVendors = async (
  ruleId: string,
  dataAssetType: string,
  allowedVendors: AllowedVendors
): Promise<Policy> => {
  const { data: currentPolicy } = await apiClient.get<Policy>(`/policies/${ruleId}`);
  const issueRules = currentPolicy.issueRules || {};
  const unauthorizedDataAccess = issueRules["unauthorized-data-access"] || { enabled: true, list: [] };
  const list = unauthorizedDataAccess.list || [];

  const index = list.findIndex((item) => item.dataAssetType === dataAssetType);

  const updatedList =
    index !== -1
      ? list.map((item) =>
        item.dataAssetType === dataAssetType
          ? { ...item, allowedVendors }
          : item
      )
      : [
        ...list,
        {
          id: crypto.randomUUID(),
          dataAssetType,
          allowedVendors,
          allowedUrlSources: {
            inherit: true,
            list: [],
            scope: { presence: false, read: false, transfer: false },
          },
        } as DataAssetItem,
      ];

  const payload: Policy = {
    ...currentPolicy,
    issueRules: {
      ...issueRules,
      "unauthorized-data-access": {
        ...unauthorizedDataAccess,
        list: updatedList,
      },
    },
  };

  const response = await apiClient.put<Policy>(`/policies/${ruleId}`, payload);
  return response.data;
};

const fetchRulePolicy = async (ruleId: string): Promise<Policy> => {
  const response = await apiClient.get<Policy>(`/policies/${ruleId}`);
  return response.data;
};


export {
  updateAllowedUrlSources,
  updateAllowedVendors,
  fetchRulePolicy
}