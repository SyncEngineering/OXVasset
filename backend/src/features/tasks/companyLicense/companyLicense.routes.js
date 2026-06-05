import { Router } from 'express';
import * as controller from './companyLicense.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { companyLicenseRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/doc-options', controller.getDocTypeOptions);
router.get('/:id', controller.getById);
router.post('/', controller.upload.single('document'), companyLicenseRules, validateRequest, controller.create);
router.put('/:id', controller.upload.single('document'), companyLicenseRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);

export default router;
