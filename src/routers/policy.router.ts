import express, { } from 'express';
const router = express.Router();
import PolicyContreller from '../controllers/policy.controller'

router.get('/policies/allowed/:ruleId', PolicyContreller.getRulePolicy);
router.put('/policies/:ruleId/data-assets/allowed-vendors', PolicyContreller.bulkUpdateAllowedVendors);
router.put('/policies/:ruleId/data-assets/allowed-scripts', PolicyContreller.bulkUpdateAllowedUrls);

export default router;