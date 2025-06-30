import { Request, Response } from 'express';
import { AllowedUrlSources, AllowedVendors } from '../types/policy.types';
import { fetchRulePolicy, updateAllowedUrlSources, updateAllowedVendors } from '../services/policy.service';

const bulkUpdateAllowedUrls = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const { dataAssetType, allowedUrlSources } = req.body;

    if (
      !dataAssetType ||
      typeof dataAssetType !== 'string' ||
      !allowedUrlSources ||
      !Array.isArray(allowedUrlSources.list) ||
      !allowedUrlSources.list.every((item: any) => typeof item.urlPattern === 'string') ||
      typeof allowedUrlSources.scope?.presence !== 'boolean' ||
      typeof allowedUrlSources.scope?.read !== 'boolean' ||
      typeof allowedUrlSources.scope?.transfer !== 'boolean'
    ) {
      res.status(400).json({ error: 'Invalid or missing required fields.' });
    }

    const updated = await updateAllowedUrlSources(
      ruleId,
      dataAssetType,
      allowedUrlSources as AllowedUrlSources
    );

    res.status(200).json({
      message: 'Allowed URL sources updated successfully.',
      updated
    });
  } catch (error: any) {
    console.error('Error updating allowed URL sources:', error?.response?.data || error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const bulkUpdateAllowedVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const { dataAssetType, allowedVendors } = req.body;

    // Basic validation
    if (
      !dataAssetType ||
      typeof dataAssetType !== 'string' ||
      !allowedVendors ||
      typeof allowedVendors.inherit !== 'boolean' ||
      !Array.isArray(allowedVendors.list) ||
      typeof allowedVendors.scope?.presence !== 'boolean' ||
      typeof allowedVendors.scope?.read !== 'boolean' ||
      typeof allowedVendors.scope?.transfer !== 'boolean'
    ) {
      res.status(400).json({ error: 'Invalid or missing required fields.' });
      return;
    }

    const updated = await updateAllowedVendors(
      ruleId,
      dataAssetType,
      allowedVendors as AllowedVendors
    );

    res.status(200).json({
      message: 'Allowed vendors updated successfully.',
      updated,
    });
  } catch (error: any) {
    console.error('Error updating allowed vendors:', error?.response?.data || error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getRulePolicy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const { name } = req.query;
    const data = await fetchRulePolicy(ruleId);

    const dataAssetTypes = data.issueRules["unauthorized-data-access"]?.list || [];
    if (!dataAssetTypes) {
      res.status(404).json({ error: 'No data asset found' });
      return;
    }

    if (name === 'all') {
      const assetTypeNames = dataAssetTypes.map((item: any) => item.dataAssetType);
      res.status(200).json({
        total: assetTypeNames.length,
        dataAssetTypes: assetTypeNames,
      });
    } else if (name) {
      const filtered = dataAssetTypes.filter((item: any) =>
        item.dataAssetType.toLowerCase().includes((name as string).toLowerCase())
      );
      res.status(200).json({
        total: filtered.length,
        dataAssetTypes: filtered,
      });
    } else {
      res.status(200).json({
        total: dataAssetTypes.length,
        data: data,
      });
    }



  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch script allowlist' });
  }
};

export default {
  bulkUpdateAllowedUrls,
  bulkUpdateAllowedVendors,
  getRulePolicy
}