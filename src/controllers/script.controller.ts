import { Request, Response } from 'express';
import { fetchAllScripts } from '../services/script.service';
import { extractFerootUuids } from '../utils/urlUuidExtractor';
import { fetchRulePolicy } from '../services/policy.service';

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

export default {
  getAllScripts,
}
