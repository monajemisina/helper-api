import { Request, Response } from 'express';
import { fetchAllVendors } from '../services/vendor.service';
import { extractFerootUuids } from '../utils/urlUuidExtractor';
import { VendorItem, VendorQueryParams } from '../types/vendor.types';

export const getAllVendors = async (req: Request<{}, {}, {}, VendorQueryParams>, res: Response): Promise<void> => {
  try {
    const endDate = Date.now();
    const startDate = endDate - 30 * 24 * 60 * 60 * 1000; // 30 days

    const sourceUrl = process.env.FEROOT_SOURCE_URL;
    if (!sourceUrl) {
      res.status(400).json({ error: "FEROOT_SOURCE_URL is not defined" });
      return;
    }

    const { projectUuid, dataSourceUuid } = extractFerootUuids(sourceUrl);
    const { name } = req.query;

    const { vendors, stats } = await fetchAllVendors({
      startDate,
      endDate,
      projectUuids: [projectUuid],
      dataSourceUuids: [dataSourceUuid],
    });

    if (name === 'all') {
      const vendorNames = vendors.map((v: VendorItem) => v.name);
      res.status(200).json({
        total: vendorNames.length,
        vendors: vendorNames,
      });
    } else if (name) {
      const filtered = vendors.filter((v: VendorItem) =>
        v.name.toLowerCase().includes(name.toLowerCase())
      );
      res.status(200).json({
        total: filtered.length,
        vendors: filtered,
      });
    } else {
      res.status(200).json({ vendors, stats });
    }

  } catch (error: any) {
    console.error("Error fetching Feroot vendors:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || "Unexpected error - vendors",
    });
  }
};

export default { getAllVendors };
