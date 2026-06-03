import { Router } from 'express';
import * as controller from './fixedAssetSummaryXL.controller.js';

const router = Router();

router.get('/', controller.exportXL);

export default router;
