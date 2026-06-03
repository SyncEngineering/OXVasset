import { Router } from 'express';
import * as controller from './assetManagement.controller.js';

const router = Router();

router.get('/', controller.getReport);

export default router;
