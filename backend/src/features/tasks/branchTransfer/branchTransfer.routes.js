import { Router } from 'express';
import * as controller from './branchTransfer.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetBranchTransferRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/location-options', controller.getLocationOptions);
router.get('/:id', controller.getById);
router.post('/', assetBranchTransferRules, validateRequest, controller.create);
router.put('/:id', assetBranchTransferRules, validateRequest, controller.update);
router.patch('/:id/approve', controller.approve);

export default router;
