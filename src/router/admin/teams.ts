import express from 'express';
import * as adminTeamController from '../../controller/admin/teams';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/upload';

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
    res.status(400).send({ error: error.message });
  }
);

export default teamsRouter;
