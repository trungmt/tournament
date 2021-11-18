import { ObjectID } from 'mongodb';
import { PaginationResult } from '../../../services/PaginationService';
import TeamModel, { ITeamModel } from '../../../models/team';
import TeamRepositoryInterface, { ResultType } from './TeamRepositoryInterface';
import Repository from '../Repository';
import { FilterQuery } from 'mongoose';

export default class TeamRepository
  extends Repository<ITeamDoc, {}>
  implements TeamRepositoryInterface
{
  constructor(model: ITeamModel = TeamModel) {
    super(model);
  }
  async insertTeam(team: ITeamDoc): Promise<ResultType> {
    return await this.model.create(team);
  }

  async updateTeam(_id: string, team: ITeamDoc): Promise<ResultType | null> {
    // TODO: validate _id of type ObjectID
    return await this.model.findOneAndUpdate({ _id }, team, {
      new: true,
      runValidators: true,
    });
  }
  async deleteTeam(_id: string): Promise<ResultType | null> {
    return await this.model.findByIdAndDelete(_id);
  }
  async getTeams(
    name: string = '',
    limit?: string,
    page?: string
  ): Promise<PaginationResult<ResultType>> {
    const filter: FilterQuery<ResultType> = {
      name: { $regex: '.*' + name + '.*', $options: 'i' },
    };
    const sort = { createdAt: -1, _id: -1 };

    return await this.getListWithPagination(filter, sort, limit, page);
  }
  async getTeamById(id: ObjectID): Promise<ResultType | null> {
    return await this.model.findById(id);
  }
}
