import { Router } from 'express';
import * as controller from './branchTransfer.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.get('/location-options', controller.getLocationOptions);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/approve', controller.approve);

export default router;
