import apiClient from '../utils/apiClient';

const fetchAllScripts = async (params: any): Promise<any> => {
  const response = await apiClient.get<any>('/scripts', { params });
  const { items, totalCount } = response.data;
  return {
    items: items,
    totalCount,
  };
};

const fetchRulePolicy = async (ruleId: string): Promise<any> => {
  const response = await apiClient.get<any>(`/policies/${ruleId}`);
  const { name, issueRules } = response.data;
  return {
    name,
    issueRules
  }

};

const updateAllowedUrlSources = async (ruleId: string, dataAssetType: string, newUrlList: []): Promise<any> => {
  const response = await apiClient.get<any>(`/policies/${ruleId}`);
  const policy = response.data;
  const issueKey = 'unauthorized-data-access';
  if (!policy.issueRules?.[issueKey]?.list) {
    throw new Error(`Policy does not contain ${issueKey} rules`);
  }

  const entries = policy.issueRules[issueKey].list;
  const updatedEntries = entries
    .filter((entry: any) => entry.dataAssetType === dataAssetType)
    .map((entry: any) => {
      entry.allowedUrlSources.list = newUrlList;
      return entry;
    });

  policy.issueRules[issueKey].list = entries;
  await apiClient.put(`/policies/${ruleId}`, policy);
  return updatedEntries;

}

export { fetchAllScripts, fetchRulePolicy, updateAllowedUrlSources };