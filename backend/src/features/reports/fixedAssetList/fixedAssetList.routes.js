import { Router } from 'express';
import * as controller from './fixedAssetList.controller.js';

const router = Router();

router.get('/', controller.getReport);

export default router;
