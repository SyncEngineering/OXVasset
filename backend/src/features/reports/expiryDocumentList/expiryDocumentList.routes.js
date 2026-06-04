import express from 'express';
import * as controller from './expiryDocumentList.controller.js';

const router = express.Router();

router.get('/', controller.getReport);

export default router;
