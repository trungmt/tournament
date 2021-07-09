import express from 'express';
import groupsRouter from './groups';
const router = express.Router();

router.use('/groups', groupsRouter);

export default router;
