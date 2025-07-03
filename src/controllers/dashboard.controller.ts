// src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';

const getDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const endDate        = Date.now();
  const startDate      = new Date('2024-05-31').getTime();
  const timezoneOffset = new Date().getTimezoneOffset();

  try {
    const data = await dashboardService.fetchDashboard({
      startDate,
      endDate,
      timezoneOffset,
    });

    res.status(200).json({
      scripts:       data.scripts,
      cookies:       data.cookies,
      dataAssets:    data.dataAssets,
      issues:        data.issues,
      screenshotUrl: data.screenshotUrl,
    });
  } catch (err: any) {
    console.error('Error in getDashboard:', err);
    res
      .status(err.status || err.response?.status || 500)
      .json({
        error:   err.message || 'Unexpected error',
        details: err.response?.data || null,
      });
  }
};

export default { getDashboard };
