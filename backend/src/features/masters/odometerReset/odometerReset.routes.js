import { Router } from 'express';
import * as controller from './odometerReset.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { odometerResetRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.post('/', odometerResetRules, validateRequest, controller.create);
router.delete('/:id', controller.remove);

export default router;
