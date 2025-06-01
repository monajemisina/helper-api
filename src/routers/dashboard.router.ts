import express, { } from 'express';
const router = express.Router();
import DashboardController from '../controllers/dashboard.controller'

router.get('/dashboard', DashboardController.getDashboard);

export default router;
