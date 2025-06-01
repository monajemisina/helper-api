import { Request, Response } from 'express';
import { fetchAllVendors } from '../services/vendor.service';
import { extractFerootUuids } from '../utils/url.util';

export const getAllVendors = async (req: Request, res: Response): Promise<void> => {
  try {

    const endDate = Date.now();
    const startDate = endDate - 30 * 24 * 60 * 60 * 1000; // last 30 days

    const sourceUrl = process.env.FEROOT_SOURCE_URL as string;
    if (!sourceUrl) {
      res.status(400).json({ error: "FEROOT_SOURCE_URL is not defined" });
      return;
    }

    const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);

    const data = await fetchAllVendors({
      startDate: startDate,
      endDate: endDate,
      projectUuids: [projectUuid],
      dataSourceUuids: [dataSourceUuid],
      categories: ["adv", "cdn", "development"],
    });

    res.status(200).send(data);

  } catch (error: any) {
    console.error("Error fetching Feroot vendors:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(error.response?.status || 500).send({
      error: error.message,
      details: error.response?.data || "Unexpected error",
    });
  }
};
export default {
  getAllVendors
}