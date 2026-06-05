import { Router } from 'express';
import * as controller from './depreciationEntry.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { depreciationEntryRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/:id', controller.getById);
router.post('/', depreciationEntryRules, validateRequest, controller.create);
router.put('/:id', depreciationEntryRules, validateRequest, controller.update);
router.patch('/:id/post', controller.post);
router.patch('/:id/reverse', controller.reverse);

export default router;
