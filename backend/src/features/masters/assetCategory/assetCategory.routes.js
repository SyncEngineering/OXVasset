import { Router } from 'express';
import * as controller from './assetCategory.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetCategoryRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', assetCategoryRules, validateRequest, controller.create);
router.put('/:id', assetCategoryRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);
router.delete('/:id', controller.remove);

export default router;
