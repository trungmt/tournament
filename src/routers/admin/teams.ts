import express from 'express';
import TeamController from '../../controllers/admin/teams';
import auth from '../../middlewares/auth';
import { uploadSingleFile } from '../../middlewares/upload';
import { validationAsync } from '../../middlewares/validation';
import {
  teamFieldValidationSchema,
  teamFileValidationSchema,
} from '../../validations/teamValidationSchema';

const teamsRouter = express.Router();
const entityName = process.env.ENTITY_TEAMS!;

const Team = new TeamController(entityName);

teamsRouter.post(
  '/upload/flagIcon',
  auth,
  uploadSingleFile('flagIcon', entityName),
  validationAsync(teamFileValidationSchema),
  Team.uploadFlagIcon
);

teamsRouter.post(
  '/',
  auth,
  validationAsync(teamFieldValidationSchema),
  Team.create
);

teamsRouter.patch(
  '/:id',
  auth,
  validationAsync(teamFieldValidationSchema),
  Team.update
);

export default teamsRouter;
