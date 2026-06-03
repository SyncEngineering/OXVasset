import { Router } from 'express';
import * as controller from './assetReclassify.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/category-options', controller.getCategoryOptions);
router.get('/group-options', controller.getGroupOptions);
router.get('/sub-group-options', controller.getSubGroupOptions);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/approve', controller.approve);

export default router;
