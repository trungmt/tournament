import { NextFunction, Request, Response } from 'express';
import AdminAbstractController from '../AdminAbstractController';
import {
  DetailFormParams,
  ListQueryParams,
} from '../AdminEntityControllerInterface';
import TeamRepositoryInterface from '../../repositories/admin/teams/TeamRepositoryInterface';
import { moveUploadFile, removeUploadFile } from '../../services/FileService';
import { CustomResponse } from '../../services/CustomResponse';
import BaseError from '../../exceptions/BaseError';

export interface TeamsListQueryParams extends ListQueryParams {
  query: string;
}
export default class TeamController extends AdminAbstractController {
  private repository: TeamRepositoryInterface;
  constructor(entityName: string, repository: TeamRepositoryInterface) {
    super(entityName);
    this.repository = repository;
  }

  create = async (
    req: Request<{}, {}, ITeamForm>,
    res: Response,
    next: NextFunction
  ) => {
    //TODO: function to prepare env const
    const { name, shortName, permalink, flagIconAdd, flagIconDelete } =
      req.body;
    const teamData: ITeamDoc = {
      name,
      nameDisplay: name,
      shortName,
      shortNameDisplay: shortName,
      permalink,
      flagIcon: flagIconAdd,
    };

    const teamFormData = this.nameTransform(teamData);
    const flagIconWidth = parseInt(process.env.DEFAULT_IMAGE_WIDTH!);
    try {
      await moveUploadFile(this.entityName, flagIconAdd, flagIconWidth);

      const team = await this.repository.insertTeam(teamFormData);

      res.status(201).send(team);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request<DetailFormParams, {}, ITeamForm>,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.params.id;
    const { name, shortName, permalink, flagIconAdd, flagIconDelete } =
      req.body;
    const teamData: ITeamDoc = {
      name,
      nameDisplay: name,
      shortName,
      shortNameDisplay: shortName,
      permalink,
      flagIcon: flagIconAdd,
    };

    const teamFormData = this.nameTransform(teamData);
    //TODO: function to prepare env const
    const flagIconWidth = parseInt(process.env.DEFAULT_IMAGE_WIDTH!);

    try {
      // In case of update, if flagIconAdd is not specify, dont change flagIcon
      if (flagIconAdd) {
        await moveUploadFile(
          process.env.ENTITY_TEAMS!,
          req.body.flagIconAdd,
          flagIconWidth
        );
      }

      const team = await this.repository.updateTeam(_id, teamFormData);

      if (team === null) {
        throw new BaseError(
          'This team does not exists. Please check again.',
          'This team does not exists. Please check again.',
          404,
          false
        );
      }

      const { flagIcon } = team;
      // In case of update, if flagIconAdd is not specify, dont change flagIcon
      if (flagIconAdd) {
        await removeUploadFile(this.entityName, flagIcon);
      }

      res.status(200).send(team);
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request<DetailFormParams, {}, ITeam>,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.params.id;
    try {
      const team = await this.repository.deleteTeam(_id);

      if (!team) {
        throw new BaseError(
          'This team does not exists. Please check again.',
          'This team does not exists. Please check again.',
          404,
          false
        );
      }
      res.status(200).send(team);
    } catch (error) {
      next(error);
    }
  };

  list = async (
    req: Request<{}, {}, ITeam>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { query, limit, page } = req.query as TeamsListQueryParams;
      const list = await this.repository.getTeams(query, limit, page);
      res.status(200).send(list);
    } catch (error) {
      next(error);
    }
  };

  detail = async (
    req: Request<DetailFormParams, {}, ITeam>,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.params.id;
    try {
      const team = await this.repository.getTeamById(_id);

      if (!team) {
        throw new BaseError(
          'This team does not exists. Please check again.',
          'This team does not exists. Please check again.',
          404,
          false
        );
      }
      res.status(200).send(team);
    } catch (error) {
      next(error);
    }
  };

  uploadFlagIcon = (req: Request, res: Response) => {
    const filename = req.file?.filename;

    if (filename) {
      const response = new CustomResponse('Upload file successfully', {
        filename,
      });
      return res.status(201).send(response);
    }
  };

  // team model will has 2 field for name, name and nameDisplay
  // prepare them so that, nameDisplay is what user input
  //                       name is lowercase of what user input (for duplicate validation purpose)
  nameTransform = (teamFormData: ITeamDoc) => {
    teamFormData.nameDisplay = teamFormData.name;
    teamFormData.name = teamFormData.name.toLowerCase();
    teamFormData.shortNameDisplay = teamFormData.shortName;
    teamFormData.shortName = teamFormData.shortName.toLowerCase();

    return teamFormData;
  };
}
