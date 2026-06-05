import { Router } from 'express';
import * as controller from './assetSubGroup.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { assetSubGroupRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/parent-options', controller.getParentOptions);
router.get('/:id', controller.getById);
router.post('/', assetSubGroupRules, validateRequest, controller.create);
router.put('/:id', assetSubGroupRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);
router.delete('/:id', controller.remove);

export default router;
