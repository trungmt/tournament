import express from 'express';
import * as authController from '../../controllers/auth/auth';
import { uploadSingleFile } from '../../middlewares/upload';

const authRouter = express.Router();
const entityName = 'users';

authRouter.post(
  '/register',
  uploadSingleFile('avatar', entityName),
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

authRouter.post('/login', authController.login);

authRouter.post('/refresh', authController.refresh);

export default authRouter;
