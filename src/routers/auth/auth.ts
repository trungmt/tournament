import express from 'express';
import * as authController from '../../controllers/auth/auth';
import { uploadSingleFile } from '../../middlewares/upload';
const router = express.Router();

router.post(
  '/register',
  uploadSingleFile('avatar'),
  authController.register,
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(400).send(error);
  }
);

router.post('/login', authController.login);

router.post('/refresh', authController.refresh);

export default router;
