import express, { } from 'express';
const router = express.Router();
import PolicyController from '../controllers/policy.controller'

router.get('/policies/allowed/:policyId', PolicyController.getRulePolicy);
router.put('/policies/:policyId/data-assets/allowed-vendors', PolicyController.bulkUpdateAllowedVendors);
router.put('/policies/:policyId/data-assets/allowed-scripts', PolicyController.bulkUpdateAllowedUrls);
router.delete('/policies/:policyId/unauthorized-scripts', PolicyController.deleteUnauthorizedScript);


export default router;