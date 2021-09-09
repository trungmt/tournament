import express, { ErrorRequestHandler, response } from 'express';
import { MulterError } from 'multer';
import * as adminTeamController from '../../controllers/admin/teams';
import auth from '../../middlewares/auth';
import { uploadSingleFile } from '../../middlewares/upload';
import { validation } from '../../middlewares/validation';
import {
  teamFieldValidationSchema,
  teamFileValidationSchema,
} from '../../validations/teamValidationSchema';

const teamsRouter = express.Router();

// teamsRouter.post(
//   '/uploadFlagIcon',
//   auth,
//   // adminTeamController.uploadFlagIcon
// );

teamsRouter.post(
  '/uploadFlagIcon',
  auth,
  uploadSingleFile('flagIcon'),
  validation(teamFileValidationSchema),
  (req, res) => {
    res.status(200).send({ aaa: 1121 });
  }
);

teamsRouter.post(
  '/',
  auth,
  uploadSingleFile('flagIcon'),
  validation(teamFieldValidationSchema),
  adminTeamController.createTeam
);

export default teamsRouter;
