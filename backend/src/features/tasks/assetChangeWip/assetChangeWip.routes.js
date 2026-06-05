import { Router } from 'express';
import * as controller from './assetChangeWip.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetChangeWipRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/:id', controller.getById);
router.post('/', assetChangeWipRules, validateRequest, controller.create);
router.put('/:id', assetChangeWipRules, validateRequest, controller.update);
router.patch('/:id/approve', controller.approve);

export default router;
