import express, { } from 'express';
const router = express.Router();
import ScriptContreller from '../controllers/script.controller'

router.get('/scripts', ScriptContreller.getAllScripts);
router.get('/scripts/allowed/:ruleId', ScriptContreller.getAllowedScripts);
router.put('/policies/:ruleId/data-assets/:dataAssetType/allowed-urls',ScriptContreller.bulkUpdateAllowedUrls
);
export default router;
