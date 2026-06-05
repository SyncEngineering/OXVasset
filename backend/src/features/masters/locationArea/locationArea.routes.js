import { Router } from 'express';
import * as controller from './locationArea.controller.js';
import validateRequest from '../../../middleware/validateRequest.js';
import { locationAreaRules } from '../../../middleware/validators.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', locationAreaRules, validateRequest, controller.create);
router.put('/:id', locationAreaRules, validateRequest, controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);
router.delete('/:id', controller.remove);

export default router;
