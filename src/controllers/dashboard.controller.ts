import { Request, Response } from 'express';
import { fetchDashboard } from '../services/dashboard.service';
import { extractFerootUuids } from '../utils/urlUuidExtractor';

const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    
    const endDate = Date.now();
    const startDate = endDate - 30 * 24 * 60 * 60 * 1000; // 30 days
    const sourceUrl = process.env.FEROOT_SOURCE_URL as string;

    if (!sourceUrl) {
      res.status(400).json({ error: "FEROOT_SOURCE_URL is not defined" });
      return;
    }
    
    const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);
    const dashboardData = await fetchDashboard({
      projectUuids: [projectUuid],
      dataSourceUuids: [dataSourceUuid],
      startDate,
      endDate,
    });

    res.status(200).send(dashboardData);
  } catch (error: any) {
    console.error("Error fetching Feroot dashboard:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(error.response?.status || 500).send({
      error: error.message,
      details: error.response?.data || "Unexpected error - dashboard",
    });
  }
};

export default {
  getDashboard,
};
