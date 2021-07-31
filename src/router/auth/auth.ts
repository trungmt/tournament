import express from 'express';
import * as authController from '../../controller/auth/auth';
const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/refresh', authController.refresh);

export default router;
