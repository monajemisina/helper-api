// src/controllers/vendor.controller.ts
import { Request, Response } from 'express';
import * as vendorService from '../services/vendor.service';

export const getAllVendors = async (req: Request, res: Response) => {
  const name = req.query.name as string | undefined;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  try {
    const result = await vendorService.fetchAllVendors({ name, page, pageSize });
    res.status(200).json(result);
  } catch (err: any) {
    console.error('Error in getAllVendors:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message, details: err.details });
  }
};

export default { getAllVendors };
