import express from 'express';
import groupsRouter from './groups';
import teamsRouter from './teams';
const router = express.Router();

router.use('/groups', groupsRouter);
router.use('/teams', teamsRouter);

export default router;
