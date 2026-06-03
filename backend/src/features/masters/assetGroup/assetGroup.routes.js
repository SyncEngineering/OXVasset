import { Router } from 'express';
import * as controller from './assetGroup.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/parent-options', controller.getParentOptions);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);

export default router;
