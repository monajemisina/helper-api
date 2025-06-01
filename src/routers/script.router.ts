import express, { } from 'express';
const router = express.Router();
import ScriptContreller from '../controllers/script.controller'

router.get('/scripts', ScriptContreller.getAllScripts);

export default router;
