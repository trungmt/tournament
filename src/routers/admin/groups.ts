import express from 'express';
import * as groupController from '../../controllers/admin/groups';
const groupsRouter = express.Router();

groupsRouter.get('/', groupController.index);

export default groupsRouter;
