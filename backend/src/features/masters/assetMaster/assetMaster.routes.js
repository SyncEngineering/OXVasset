import { Router } from 'express';
import * as controller from './assetMaster.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/dropdown-options', controller.getDropdownOptions);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/status', controller.updateStatus);
router.patch('/:id/toggle-active', controller.toggleActive);

export default router;
