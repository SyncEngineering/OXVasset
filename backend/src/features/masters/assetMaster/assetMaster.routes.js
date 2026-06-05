import { Router } from 'express';
import * as controller from './assetMaster.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetMasterRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/lookup-options', controller.getDropdownOptions);
router.get('/:id', controller.getById);
router.post('/', assetMasterRules, validateRequest, controller.create);
router.put('/:id', assetMasterRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);

export default router;
