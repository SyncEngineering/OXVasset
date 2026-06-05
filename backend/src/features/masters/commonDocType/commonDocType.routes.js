import { Router } from 'express';
import * as controller from './commonDocType.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { commonDocTypeRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', commonDocTypeRules, validateRequest, controller.create);
router.put('/:id', commonDocTypeRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);

export default router;
