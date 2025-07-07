import { Request, Response } from 'express';
import { UpdateAllowedUrlSourcesParams, UpdateAllowedVendorsParams } from '../types/policy.types';
import * as policyService from '../services/policy.service';
import { removeUnauthorizedScriptsByKeyword } from '../services/policy.service';


const bulkUpdateAllowedUrls = async (req: Request, res: Response) => {
  const { policyId } = req.params;
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
      policyId,
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
  const { policyId } = req.params;
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
      policyId,
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
    const { policyId } = req.params;
    const policy = await policyService.fetchRulePolicy(policyId);
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
      res
        .status(200)
        .json({ total: types.length, dataAssetTypes: types });
      return;

    } else if (dataAssetType) {
      const filtered = dataAccess.filter(
        item => item.dataAssetType.toLowerCase() === dataAssetType
      );
      const types = filtered.map(item => item);
      res.status(200).send({ dataAccessType: types })
      return;

    }

    switch (issueRule) {
      case 'cookie': {
        const unauthorizedCookies = cookies.map(c => c.namePattern);
        res
          .status(200)
          .json({ total: unauthorizedCookies.length, unauthorizedCookies });
        return;

      }
      case 'script': {
        const unauthorizedScripts = scripts.map(s => s.urlPattern);
        res
          .status(200)
          .json({ total: unauthorizedScripts.length, unauthorizedScripts });
        return;

      }
      case 'vendor': {
        const unauthorizedVendors = vendors.map(v => v.vendorId);
        res
          .status(200)
          .json({ total: unauthorizedVendors.length, unauthorizedVendors });
        return;

      }
      default:
        res.status(200).json(policy);
        return;

    }

  } catch (err: any) {
    console.error('getRulePolicy error:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message || 'Failed to fetch policy' });
    return;

  }
};

const deleteUnauthorizedScript = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { policyId } = req.params;
  const pattern = (req.body.urlPattern as string | undefined)?.trim();

  if (!pattern) {
    res.status(400).json({ error: 'urlPattern is required in request body' });
    return;
  }

  try {
    const updated = await policyService.removeUnauthorizedScripts(
      policyId,
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

const deleteUnauthorizedScriptsByKeyword = async (
  req: Request,
  res: Response
) => {
  const { policyId } = req.params;
  const { keyword } = req.body;

  if (!policyId || typeof policyId !== 'string') {
    res.status(400).json({ error: 'policyId is required in URL and must be a string.' });
    return;
  }

  if (!keyword || typeof keyword !== 'string') {
    res.status(400).json({ error: 'keyword is required in body and must be a string.' });
    return;

  }

  try {
    const updatedPolicy = await removeUnauthorizedScriptsByKeyword(policyId, keyword);
    res.status(200).json({ message: 'Matching scripts removed successfully.', policy: updatedPolicy });
    return;

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    return;

  }
};

export default {
  bulkUpdateAllowedUrls,
  bulkUpdateAllowedVendors,
  getRulePolicy,
  deleteUnauthorizedScript,
  deleteUnauthorizedScriptsByKeyword
};
