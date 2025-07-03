import { Request, Response } from 'express';
import { fetchAllScripts } from '../services/script.service';
import { extractFerootUuids } from '../utils/urlUuidExtractor';

const getAllScripts = async (req: Request, res: Response): Promise<any> => {
  try {
    const endDate = Date.now();
    const startDate = new Date('2025-03-31').getTime();
    const sourceUrl = process.env.FEROOT_SOURCE_URL;
    if (!sourceUrl) {
      res.status(400).json({ error: "FEROOT_SOURCE_URL is not defined" });
      return;
    }

    const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);
    const { name, url } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const { items: scripts, totalCount } = await fetchAllScripts({
      startDate,
      endDate,
      projectUuids: [projectUuid],
      dataSourceUuids: [dataSourceUuid],
      page,
      pageSize,
    });
    if (name === 'all') {
     const scriptNames = [...new Set(scripts.map((sc: any) => sc.scriptName).filter((name: string | undefined) => name))]
      res.status(200).json({
        page,
        pageSize,
        totalCount,
        scriptCount: scriptNames.length,
        scripts: scriptNames,
      });
    } else if (name) {
      const filtered = scripts.filter((sc: any) =>
        sc.scriptName.toLowerCase().includes((name as string).toLowerCase())
      );
      res.status(200).json({
        page,
        pageSize,
        totalCount,
        scripts: filtered,
     
      });
    } else if (url === 'all') {
      const scriptUrls = scripts.map((sc: any) => sc.scriptUrl);
      res.status(200).json({
        page,
        pageSize,
        totalCount,
        scripts: scriptUrls,
     
      });
    } else if (url) {
      const filtered = scripts.filter((sc: any) =>
        sc.scriptUrl.toLowerCase().includes((url as string).toLowerCase())
      );
      res.status(200).json({
        total: filtered.length,
        scripts: filtered,
        page,
        pageSize,
        totalCount,
      });
    } else {
      res.status(200).json({ totalCount, page, pageSize, scripts});
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
