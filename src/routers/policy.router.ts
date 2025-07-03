import express, { } from 'express';
const router = express.Router();
import PolicyController from '../controllers/policy.controller'

router.get('/policies/allowed/:ruleId', PolicyController.getRulePolicy);
router.put('/policies/:ruleId/data-assets/allowed-vendors', PolicyController.bulkUpdateAllowedVendors);
router.put('/policies/:ruleId/data-assets/allowed-scripts', PolicyController.bulkUpdateAllowedUrls);
router.delete('/policies/:ruleId/unauthorized-scripts', PolicyController.deleteUnauthorizedScript);


export default router;