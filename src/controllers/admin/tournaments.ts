import { NextFunction, Request, Response, RequestHandler } from 'express';
import BaseError from '../../exceptions/BaseError';
import TournamentRepositoryInterface from '../../repositories/admin/tournaments/TournamentRepositoryInterface';
import AdminAbstractController from '../AdminAbstractController';
import {
  DetailFormParams,
  ListQueryParams,
} from '../AdminEntityControllerInterface';

interface TournamentsListQueryParams extends ListQueryParams {
  query: string;
}

export default class TournamentController extends AdminAbstractController {
  private repository: TournamentRepositoryInterface;
  constructor(entityName: string, repository: TournamentRepositoryInterface) {
    super(entityName);
    this.repository = repository;
  }

  create = async (
    req: Request<{}, {}, ITournamentForm>,
    res: Response,
    next: NextFunction
  ) => {
    const tournamentFormData = this.prepareTournamentFormFromBody(req.body);
    try {
      const tournament = await this.repository.insertTournament(
        tournamentFormData
      );

      res.status(201).send(tournament);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request<DetailFormParams, {}, ITournamentForm>,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.params.id;
    const tournamentFormData = this.prepareTournamentFormFromBody(req.body);

    try {
      const tournament = await this.repository.updateTournament(
        _id,
        tournamentFormData
      );

      if (tournament === null) {
        throw new BaseError(
          'This tournament does not exists. Please check again.',
          'This tournament does not exists. Please check again.',
          404,
          false
        );
      }

      res.status(200).send(tournament);
    } catch (error) {
      next(error);
    }
  };
  delete = async (
    req: Request<DetailFormParams, {}, ITournament>,
    res: Response,
    next: NextFunction
  ) => {};
  list = async (
    req: Request<{}, {}, ITournament>,
    res: Response,
    next: NextFunction
  ) => {};
  detail = async (
    req: Request<DetailFormParams, {}, ITournament>,
    res: Response,
    next: NextFunction
  ) => {};

  // tournament model will has 2 field for name: name and nameDisplay
  // prepare them so that, nameDisplay is what user input
  //                       name is lowercase of what user input (for duplicate validation purpose)
  nameTransform = (tournamentFormData: ITournamentDoc) => {
    tournamentFormData.nameDisplay = tournamentFormData.name;
    tournamentFormData.name = tournamentFormData.name.toLowerCase();

    return tournamentFormData;
  };

  prepareTournamentFormFromBody = (body: ITournamentForm): ITournamentDoc => {
    const {
      name,
      permalink,
      groupStageEnable,
      groupStageGroupSize,
      groupStageGroupAdvancedSize,
      groupStageRoundRobinType,
      groupStageType,
      finalStageType,
      finalStageRoundRobinType,
      finalStageSingleBronzeEnable,
    } = body;

    const tournamentData: ITournamentDoc = {
      name,
      nameDisplay: name,
      permalink,
      groupStageEnable,
      groupStageGroupSize,
      groupStageGroupAdvancedSize,
      groupStageRoundRobinType,
      groupStageType,
      finalStageType,
      finalStageRoundRobinType,
      finalStageSingleBronzeEnable,
    };

    const tournamentFormData = this.nameTransform(tournamentData);

    return tournamentFormData;
  };
}
