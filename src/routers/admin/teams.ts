import express from 'express';
import auth from '../../middlewares/auth';
import TeamController from '../../controllers/admin/teams';
import TeamService from '../../repositories/admin/teams/TeamRepository';
import { uploadSingleFile } from '../../middlewares/upload';
import { validationAsync } from '../../middlewares/validation';
import {
  teamFieldValidationSchema,
  teamFileValidationSchema,
} from '../../validations/teamValidationSchema';
import constants from '../../configs/constants';

const teamsRouter = express.Router();
const entityName = constants.ENTITY_TEAMS;

const service = new TeamService();
const Team = new TeamController(entityName, service);

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
  validationAsync(teamFieldValidationSchema()),
  Team.create
);

teamsRouter.patch(
  '/:id',
  auth,
  validationAsync(teamFieldValidationSchema(true)),
  Team.update
);

teamsRouter.delete('/:id', auth, Team.delete);

teamsRouter.get('/', auth, Team.list);

teamsRouter.get('/:id', auth, Team.detail);

export default teamsRouter;
