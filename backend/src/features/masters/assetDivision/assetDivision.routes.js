import { Router } from 'express';
import * as controller from './assetDivision.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetDivisionRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', assetDivisionRules, validateRequest, controller.create);
router.put('/:id', assetDivisionRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);
router.delete('/:id', controller.remove);

export default router;
