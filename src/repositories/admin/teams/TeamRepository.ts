import { ObjectID } from 'mongodb';
import PaginationService, {
  PaginationResult,
} from '../../../services/PaginationService';
import TeamModel, { ITeamModel } from '../../../models/team';
import TeamRepositoryInterface from './TeamRepositoryInterface';
export default class TeamRepository implements TeamRepositoryInterface {
  private teamModel: ITeamModel;
  constructor(teamModel: ITeamModel = TeamModel) {
    this.teamModel = teamModel;
  }
  insertTeam(team: ITeamDoc): Promise<ITeamDoc> {
    throw new Error('Method not implemented.');
  }
  updateTeam(id: ObjectID, team: ITeamDoc): Promise<ITeamDoc> {
    throw new Error('Method not implemented.');
  }
  deleteTeam(id: ObjectID): Promise<ITeamDoc> {
    throw new Error('Method not implemented.');
  }
  async getTeams(
    name: string = '',
    limit?: number,
    page?: number
  ): Promise<PaginationResult<any>> {
    const query = this.teamModel
      .find({ name: { $regex: '.*' + name + '.*', $options: 'i' } })
      .sort({ createdAt: -1, _id: -1 });

    return await PaginationService.doPagination(query, limit, page);
  }
  getTeamById(id: ObjectID): Promise<ITeamDoc> {
    throw new Error('Method not implemented.');
  }
}
