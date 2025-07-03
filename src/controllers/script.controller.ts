import { Request, Response } from 'express';
import * as scriptService from '../services/script.service';

const getAllScripts = async (req: Request, res: Response) => {
  const { name, url } = req.query as { name?: string; url?: string };
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  try {
    const result = await scriptService.fetchAllScripts({ name, url, page, pageSize });
    res.status(200).json(result);
  } catch (err: any) {
    console.error('Error in getAllScripts:', err);
    res
      .status(err.status || 500)
      .json({ error: err.message, details: err.details });
  }
};

export default {
  getAllScripts
}
