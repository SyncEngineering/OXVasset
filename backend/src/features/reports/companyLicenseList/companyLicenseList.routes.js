import { Router } from 'express';
import * as controller from './companyLicenseList.controller.js';

const router = Router();

router.get('/', controller.getReport);
router.get('/export', controller.exportXL);

export default router;
