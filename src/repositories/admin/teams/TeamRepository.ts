import { ObjectID } from 'mongodb';
import { PaginationResult } from '../../../services/PaginationService';
import TeamModel, { ITeamModel } from '../../../models/team';
import TeamRepositoryInterface from './TeamRepositoryInterface';
import Repository from '../Repository';
import { FilterQuery } from 'mongoose';

export default class TeamRepository
  extends Repository<ITeamDoc, {}>
  implements TeamRepositoryInterface
{
  constructor(model: ITeamModel = TeamModel) {
    super(model);
  }
  async insertTeam(team: ITeamDoc): Promise<RepositoryResultType<ITeamDoc>> {
    return await this.model.create(team);
  }

  async updateTeam(
    _id: string,
    team: ITeamDoc
  ): Promise<RepositoryResultType<ITeamDoc> | null> {
    const isValidId = ObjectID.isValid(_id);
    if (isValidId === false) {
      return null;
    }

    let oldTeam: RepositoryResultType<ITeamDoc> | null = null;
    if (team.flagIcon === '') {
      oldTeam = await this.model.findById(_id);
      if (oldTeam === null) {
        return oldTeam;
      }
      team.flagIcon = oldTeam?.flagIcon;
    }

    oldTeam = await this.model.findOneAndUpdate({ _id }, team, {
      runValidators: true,
    });

    return oldTeam;
  }
  async deleteTeam(
    _id: string
  ): Promise<RepositoryResultType<ITeamDoc> | null> {
    const isValidId = ObjectID.isValid(_id);
    if (isValidId === false) {
      return null;
    }
    return await this.model.findByIdAndDelete(_id);
  }
  async getTeams(
    query: string = '',
    limit?: string,
    page?: string
  ): Promise<PaginationResult<RepositoryResultType<ITeamDoc>>> {
    const filter: FilterQuery<RepositoryResultType<ITeamDoc>> = {
      name: { $regex: '.*' + query + '.*', $options: 'i' },
    };
    const sort = { createdAt: -1, _id: -1 };

    return await this.getListWithPagination(filter, sort, limit, page);
  }
  async getTeamById(
    _id: string
  ): Promise<RepositoryResultType<ITeamDoc> | null> {
    const isValidId = ObjectID.isValid(_id);
    if (isValidId === false) {
      return null;
    }
    return await this.model.findById(_id);
  }
}
