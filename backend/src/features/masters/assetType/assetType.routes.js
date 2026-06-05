import { Router } from 'express';
import * as controller from './assetType.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetTypeRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', assetTypeRules, validateRequest, controller.create);
router.put('/:id', assetTypeRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);

export default router;
