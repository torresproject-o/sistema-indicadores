import express from 'express';
import { handleUpload, upload } from '../controllers/upload.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', verifyToken, upload.single('file'), handleUpload);

export default router;
