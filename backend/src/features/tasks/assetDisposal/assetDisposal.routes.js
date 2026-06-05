import { Router } from 'express';
import * as controller from './assetDisposal.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetDisposalRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/:id', controller.getById);
router.post('/', assetDisposalRules, validateRequest, controller.create);
router.put('/:id', assetDisposalRules, validateRequest, controller.update);
router.patch('/:id/approve', controller.approve);

export default router;
