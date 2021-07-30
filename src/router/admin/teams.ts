import express from 'express';
import * as adminTeamController from '../../controller/admin/teams';
const teamsRouter = express.Router();

teamsRouter.post('/teams', adminTeamController.createTeam);
