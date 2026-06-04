import express from 'express';
import * as controller from './dashboard.controller.js';

const router = express.Router();

router.get('/stats', controller.getDashboardStats);

export default router;
