import { Request, Response } from 'express';
import { fetchAllScripts, fetchRulePolicy, updateAllowedUrlSources } from '../services/script.service';
import { extractFerootUuids } from '../utils/urlUuidExtractor';

const getAllScripts = async (req: Request, res: Response): Promise<any> => {
  try {
    const endDate = Date.now();
    const startDate = endDate - 30 * 24 * 60 * 60 * 1000; // 30 days
    const sourceUrl = process.env.FEROOT_SOURCE_URL;
    if (!sourceUrl) {
      res.status(400).json({ error: "FEROOT_SOURCE_URL is not defined" });
      return;
    }

    const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);
    const { name, url } = req.query;
    const { items: scripts, totalCount } = await fetchAllScripts({
      startDate,
      endDate,
      projectUuids: [projectUuid],
      dataSourceUuids: [dataSourceUuid],
    });

    if (name === 'all') {
      const scriptNames = scripts.map((sc: any) => sc.scriptName);
      res.status(200).json({
        total: scriptNames.length,
        scripts: scriptNames,
      });
    } else if (name) {
      const filtered = scripts.filter((sc: any) =>
        sc.scriptName.toLowerCase().includes((name as string).toLowerCase())
      );
      res.status(200).json({
        total: filtered.length,
        scripts: filtered,
      });
    } else if (url === 'all') {
      const scriptUrls = scripts.map((sc: any) => sc.scriptUrl);
      res.status(200).json({
        total: scriptUrls.length,
        scripts: scriptUrls,
      });
    } else if (url) {
      const filtered = scripts.filter((sc: any) =>
        sc.scriptUrl.toLowerCase().includes((url as string).toLowerCase())
      );
      res.status(200).json({
        total: filtered.length,
        scripts: filtered,
      });
    } else {
      res.status(200).json({ totalCount, scripts });
    }

  } catch (error: any) {
    console.error('Error fetching Feroot scripts:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(error.response?.status || 500).send({
      error: error.message,
      details: error.response?.data || 'Unexpected error - scripts',
    });
  }

};

const getAllowedScripts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ruleId } = req.params;
    const { name } = req.query;
    const data = await fetchRulePolicy(ruleId);

    const dataAssetTypes = data.issueRules["unauthorized-data-access"]?.list;
    if (!dataAssetTypes) {
      res.status(404).json({ error: 'No data asset found' });
      return;
    }

    const filtered = name ? dataAssetTypes.filter((item: any) => item.dataAssetType.toLowerCase().includes((name as string).toLowerCase())) : data;

    res.status(200).json({ name: data.name, filtered });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch script allowlist' });
  }
};

const bulkUpdateAllowedUrls = async (req: Request, res: Response): Promise<any> => {
  try {
    const { ruleId, dataAssetType } = req.params;
    const { allowedUrlSources } = req.body;
 
    if (!Array.isArray(allowedUrlSources)) {
      res.status(400).json({ error: 'allowedUrlSources must be an array' });
      return;
    }
    const updatedItems = await updateAllowedUrlSources(ruleId, dataAssetType, allowedUrlSources as any);
    res.status(200).json({
      message: 'Allowed URL sources updated successfully',
      updatedCount: updatedItems.length,
    });
  } catch (error) {
    console.error('Error updating allowed URL sources:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getAllScripts,
  getAllowedScripts,
  bulkUpdateAllowedUrls
}


