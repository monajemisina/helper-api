import express, { } from 'express';
const router = express.Router();
import VendorController from '../controllers/vendor.controller'

router.get('/vendors', VendorController.getAllVendors);

export default router;
