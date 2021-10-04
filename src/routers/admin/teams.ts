import express, { ErrorRequestHandler, response } from 'express';
import * as adminTeamController from '../../controllers/admin/teams';
import auth from '../../middlewares/auth';
import { uploadSingleFile } from '../../middlewares/upload';
import { validation, validationAsync } from '../../middlewares/validation';
import {
  teamFieldValidationSchema,
  teamFileValidationSchema,
} from '../../validations/teamValidationSchema';

const teamsRouter = express.Router();
const entityName = process.env.ENTITY_TEAMS!;

teamsRouter.post(
  '/upload/flagIcon',
  auth,
  uploadSingleFile('flagIcon', entityName),
  validation(teamFileValidationSchema),
  adminTeamController.uploadFlagIcon
);

teamsRouter.post(
  '/',
  auth,
  validationAsync(teamFieldValidationSchema),
  adminTeamController.createTeam
);

  adminTeamController.createTeam
);

export default teamsRouter;
