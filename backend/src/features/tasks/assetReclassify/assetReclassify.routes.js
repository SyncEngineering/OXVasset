import { Router } from 'express';
import * as controller from './assetReclassify.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetReclassifyRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/category-options', controller.getCategoryOptions);
router.get('/group-options', controller.getGroupOptions);
router.get('/sub-group-options', controller.getSubGroupOptions);
router.get('/:id', controller.getById);
router.post('/', assetReclassifyRules, validateRequest, controller.create);
router.put('/:id', assetReclassifyRules, validateRequest, controller.update);
router.patch('/:id/approve', controller.approve);

export default router;
