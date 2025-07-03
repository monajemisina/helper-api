// src/controllers/policy.controller.ts
import { Request, Response } from 'express';
import { UpdateAllowedUrlSourcesParams, UpdateAllowedVendorsParams } from '../types/policy.types';
import * as policyService from '../services/policy.service';

const bulkUpdateAllowedUrls = async (req: Request, res: Response) => {
  const { ruleId } = req.params;
  const { dataAssetType, allowedUrlSources } = req.body;

  if (
    typeof dataAssetType !== 'string' ||
    !allowedUrlSources ||
    !Array.isArray(allowedUrlSources.list) ||
    !allowedUrlSources.list.every((i: any) => typeof i.urlPattern === 'string') ||
    typeof allowedUrlSources.scope?.presence !== 'boolean' ||
    typeof allowedUrlSources.scope?.read     !== 'boolean' ||
    typeof allowedUrlSources.scope?.transfer !== 'boolean'
  ) {
    res.status(400).json({ error: 'Invalid or missing fields.' });
    return;
  }

  try {
    const params: UpdateAllowedUrlSourcesParams = {
      ruleId,
      dataAssetType,
      allowedUrlSources,
    };
    const updated = await policyService.updateAllowedUrlSources(params);
    res.status(200).json({
      message: 'Allowed URL sources updated successfully.',
      updated,
    });
  } catch (err: any) {
    console.error('bulkUpdateAllowedUrls error:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Internal server error' });
  }
};

const bulkUpdateAllowedVendors = async (req: Request, res: Response) => {
  const { ruleId } = req.params;
  const { dataAssetType, allowedVendors } = req.body;

  if (
    typeof dataAssetType !== 'string' ||
    !allowedVendors ||
    typeof allowedVendors.inherit !== 'boolean' ||
    !Array.isArray(allowedVendors.list) ||
    typeof allowedVendors.scope?.presence !== 'boolean' ||
    typeof allowedVendors.scope?.read     !== 'boolean' ||
    typeof allowedVendors.scope?.transfer !== 'boolean'
  ) {
    res.status(400).json({ error: 'Invalid or missing fields.' });
    return;
  }

  try {
    const params: UpdateAllowedVendorsParams = {
      ruleId,
      dataAssetType,
      allowedVendors,
    };
    const updated = await policyService.updateAllowedVendors(params);
    res.status(200).json({
      message: 'Allowed vendors updated successfully.',
      updated,
    });
  } catch (err: any) {
    console.error('bulkUpdateAllowedVendors error:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Internal server error' });
  }
};

const getRulePolicy = async (req: Request, res: Response) => {
  const { ruleId } = req.params;
  const nameFilter = (req.query.name as string | undefined)?.toLowerCase();

  try {
    const policy = await policyService.fetchRulePolicy(ruleId);
    const items = policy.issueRules?.['unauthorized-data-access']?.list || [];

    if (nameFilter === 'all') {
      const types = items.map(i => i.dataAssetType);
      res.status(200).json({ total: types.length, dataAssetTypes: types });
      return;
    }

    if (nameFilter) {
      const filtered = items.filter(i =>
        i.dataAssetType.toLowerCase().includes(nameFilter)
      );
      res
        .status(200)
        .json({ total: filtered.length, dataAssetTypes: filtered });
      return;
    }

    res.status(200).json({ total: items.length, data: policy });
  } catch (err: any) {
    console.error('getRulePolicy error:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Failed to fetch policy' });
  }
};

export default {
  bulkUpdateAllowedUrls,
  bulkUpdateAllowedVendors,
  getRulePolicy,
};
