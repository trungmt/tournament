import express from 'express';
import auth from '../../middlewares/auth';
import TournamentController from '../../controllers/admin/tournaments';
import TournamentRepository from '../../repositories/admin/tournaments/TournamentRepository';
import { validationAsync } from '../../middlewares/validation';
import { tournamentFieldValidationSchema } from '../../validations/tournamentValidationSchema';

const tournamentsRouter = express.Router();
const entityName = process.env.ENTITY_TOURNAMENTS!;

const service = new TournamentRepository();
const Tournament = new TournamentController(entityName, service);

tournamentsRouter.post(
  '/',
  auth,
  validationAsync(tournamentFieldValidationSchema(), true),
  Tournament.create
);

tournamentsRouter.patch(
  '/:id',
  auth,
  validationAsync(tournamentFieldValidationSchema(true), true),
  Tournament.update
);

tournamentsRouter.delete('/:id', auth, Tournament.delete);

tournamentsRouter.get('/', auth, Tournament.list);

tournamentsRouter.get('/:id', auth, Tournament.detail);

export default tournamentsRouter;
