import { Router } from 'express';
import * as controller from './odometerReset.controller.js';

const router = Router();

router.get('/', controller.getAll);
router.get('/asset-options', controller.getAssetOptions);
router.post('/', controller.create);

export default router;
