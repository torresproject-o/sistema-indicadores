import express from 'express';
import { getKPIs, getSalesOverTime, getSalesByCategory } from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/kpis', verifyToken, getKPIs);
router.get('/sales-over-time', verifyToken, getSalesOverTime);
router.get('/sales-by-category', verifyToken, getSalesByCategory);

export default router;
