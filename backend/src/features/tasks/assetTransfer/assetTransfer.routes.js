import { Router } from 'express';
import * as controller from './assetTransfer.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetTransferRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/division-options', controller.getDivisionOptions);
router.get('/location-options', controller.getLocationOptions);
router.get('/:id', controller.getById);
router.post('/', assetTransferRules, validateRequest, controller.create);
router.put('/:id', assetTransferRules, validateRequest, controller.update);
router.patch('/:id/approve', controller.approve);

export default router;
