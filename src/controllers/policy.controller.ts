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
    typeof allowedUrlSources.scope?.read !== 'boolean' ||
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
    typeof allowedVendors.scope?.read !== 'boolean' ||
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
  try {
    const { ruleId } = req.params;
    const policy = await policyService.fetchRulePolicy(ruleId);
    const dataAccess = policy?.issueRules?.['unauthorized-data-access']?.list || [];
    const cookies = policy?.issueRules?.['unauthorized-cookies']?.list || [];
    const scripts = policy?.issueRules?.['unauthorized-scripts']?.list || [];
    const vendors = policy?.issueRules?.['unauthorized-vendors']?.list || [];
    const { dataAssetType, issueRule } = req.query as {
      dataAssetType?: string;
      issueRule?: string;
    };

    if (dataAssetType === 'all') {
      const types = dataAccess.map(i => i.dataAssetType);
      return res
        .status(200)
        .json({ total: types.length, dataAssetTypes: types });
    } else if (dataAssetType) {
      const filtered = dataAccess.filter(
        item => item.dataAssetType.toLowerCase() === dataAssetType
      );
      const types = filtered.map(item => item);
      return res.status(200).send({ dataAccessType: types })
    }

    switch (issueRule) {
      case 'cookie': {
        const unauthorizedCookies = cookies.map(c => c.namePattern);
        return res
          .status(200)
          .json({ total: unauthorizedCookies.length, unauthorizedCookies });
      }
      case 'script': {
        const unauthorizedScripts = scripts.map(s => s.namePattern);
        return res
          .status(200)
          .json({ total: unauthorizedScripts.length, unauthorizedScripts });
      }
      case 'vendor': {
        const unauthorizedVendors = vendors.map(v => v.vendorId);
        return res
          .status(200)
          .json({ total: unauthorizedVendors.length, unauthorizedVendors });
      }
      default:
        return res.status(200).json(policy);
    }

  } catch (err: any) {
    console.error('getRulePolicy error:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Failed to fetch policy' });
  }
};

const deleteUnauthorizedScript = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { ruleId } = req.params;
  const pattern = (req.query.urlPattern as string | undefined)?.trim();

  if (!pattern) {
    res.status(400).json({ error: 'urlPattern query param is required' });
    return;
  }

  try {
    const updated = await policyService.removeUnauthorizedScripts(
      ruleId,
      pattern
    );
    res.status(200).json({
      message: `Removed "${pattern}" from unauthorized-scripts`,
      policy: updated,
    });
  } catch (err: any) {
    console.error('deleteUnauthorizedScript error:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Failed to delete script pattern' });
  }
};

export default {
  bulkUpdateAllowedUrls,
  bulkUpdateAllowedVendors,
  getRulePolicy,
  deleteUnauthorizedScript
};
