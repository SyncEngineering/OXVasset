import { Router } from 'express';
import * as controller from './expiryDocEntry.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/doc-options', controller.getDocTypeOptions);
router.get('/:id', controller.getById);
router.post('/', controller.upload.single('document'), controller.create);
router.put('/:id', controller.upload.single('document'), controller.update);
router.patch('/:id/toggle-active', controller.toggleActive);

export default router;
