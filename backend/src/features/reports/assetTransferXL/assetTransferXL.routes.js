import { Router } from 'express';
import * as controller from './assetTransferXL.controller.js';

const router = Router();

router.get('/', controller.exportXL);

export default router;
