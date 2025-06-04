import { Request, Response } from 'express';
import { fetchAllScripts } from '../services/script.service';
import { extractFerootUuids } from '../utils/urlUuidExtractor';
import { getSegmentedPatterns } from '../utils/urlPatternUtils';

const getAllScripts = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const endDate = Date.now();
    const startDate = endDate - 30 * 24 * 60 * 60 * 1000; // 30 days
    const sourceUrl = process.env.FEROOT_SOURCE_URL;

    if (!sourceUrl) {
      res.status(400).json({ error: "FEROOT_SOURCE_URL is not defined" });
      return;
    }
    const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);

    const data = await fetchAllScripts({
      startDate,
      endDate,
      projectUuids: [projectUuid],
      dataSourceUuids: [dataSourceUuid],
      limit: 1000,
      page: 1,
    });
    const scriptUrls = data.items.map((item: any) => item.scriptUrl).sort();
    const totalCount = scriptUrls.length;
    // const segmentedScripts = getSegmentedPatterns({
    //   urls: scriptUrls,
    //   totalCount
    // }); not functional yet
    
    res.status(200).send({
      scriptUrls,
      totalCount,
    });

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
  getAllScripts
}
