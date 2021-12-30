import express from 'express';
import groupsRouter from './groups';
import teamsRouter from './teams';
import tournamentsRouter from './tournament';
const router = express.Router();

router.use('/groups', groupsRouter);
router.use('/teams', teamsRouter);
router.use('/tournaments', tournamentsRouter);

export default router;
