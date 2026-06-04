import express from 'express';
import * as controller from './assetBarcode.controller.js';

const router = express.Router();

router.get('/', controller.getAssets);

export default router;
