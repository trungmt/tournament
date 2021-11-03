import { NextFunction, Request, Response } from 'express';
import AdminAbstractController from '../AdminAbstractController';
import {
  ModifyFormParams,
  ListQueryParams,
} from '../AdminEntityControllerInterface';
import TeamRepositoryInterface from '../../repositories/admin/teams/TeamRepositoryInterface';
import Team from '../../models/team';
import { moveUploadFile } from '../../services/FileService';
import { CustomResponse } from '../../services/CustomResponse';
import BaseError from '../../exceptions/BaseError';

export interface TeamsListQueryParams extends ListQueryParams {
  name: string;
}
export default class TeamController extends AdminAbstractController {
  private service: TeamRepositoryInterface;
  constructor(entityName: string, service: TeamRepositoryInterface) {
    super(entityName);
    this.service = service;
  }

  create = async (
    req: Request<{}, {}, ITeamDoc>,
    res: Response,
    next: NextFunction
  ) => {
    const teamFormData = this.nameTransform(req.body);

    const team = new Team(teamFormData);

    //TODO: function to prepare env const
    const flagIconWidth = parseInt(process.env.DEFAULT_IMAGE_WIDTH!);
    try {
      await moveUploadFile(
        process.env.ENTITY_TEAMS!,
        req.body.flagIcon,
        flagIconWidth
      );

      await team.save();

      res.status(201).send(team);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request<ModifyFormParams, {}, ITeamDoc>,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.params.id;
    const teamFormData = this.nameTransform(req.body);
    //TODO: function to prepare env const
    const flagIconWidth = parseInt(process.env.DEFAULT_IMAGE_WIDTH!);

    try {
      await moveUploadFile(
        process.env.ENTITY_TEAMS!,
        req.body.flagIcon,
        flagIconWidth
      );

      const team = await Team.findOneAndUpdate({ _id }, teamFormData, {
        new: true,
        runValidators: true,
      });

      if (team === null) {
        throw new BaseError(
          'This team does not exists. Please check again.',
          'This team does not exists. Please check again.',
          404,
          false,
          { redirect: '/api/admin/teams' }
        );
      }

      res.status(200).send(team);
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request<ModifyFormParams, {}, ITeam>,
    res: Response,
    next: NextFunction
  ) => {
    const _id = req.params.id;
    try {
      const team = await Team.findByIdAndDelete(_id);

      if (!team) {
        throw new BaseError(
          'This team does not exists. Please check again.',
          'This team does not exists. Please check again.',
          404,
          false,
          { redirect: '/api/admin/teams' }
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
      const { name, limit, page } = req.query as TeamsListQueryParams;
      const list = await this.service.getTeams(
        name,
        parseInt(limit),
        parseInt(page)
      );
      res.status(200).send(list);
    } catch (error) {
      next(error);
    }
  };

  form = async (
    req: Request<ModifyFormParams, {}, ITeam>,
    res: Response,
    next: NextFunction
  ) => {};

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

    return teamFormData;
  };
}
