import express from 'express';
import { MulterError } from 'multer';
import * as adminTeamController from '../../controllers/admin/teams';
import auth from '../../middlewares/auth';
import { upload } from '../../middlewares/upload';

const teamsRouter = express.Router();

teamsRouter.post(
  '/',
  auth,
  upload.single('flagIcon'),
  adminTeamController.createTeam,
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // TODO: make response for form validation errors
    if (error instanceof MulterError) {
      return res.status(400).send(error);
    }
    res.status(400).send({ message: error.message });
  }
);

export default teamsRouter;
