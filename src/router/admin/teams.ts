import express from 'express';
import * as adminTeamController from '../../controller/admin/teams';
import auth from '../../middleware/auth';

const teamsRouter = express.Router();

teamsRouter.post('/', auth, adminTeamController.createTeam);

export default teamsRouter;
