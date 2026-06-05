import { Router } from 'express';
import * as controller from './expiryDocType.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { expiryDocTypeRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', expiryDocTypeRules, validateRequest, controller.create);
router.put('/:id', expiryDocTypeRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);

export default router;
