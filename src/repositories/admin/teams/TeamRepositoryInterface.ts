import { ObjectID } from 'mongodb';
import { PaginationResult } from '../../../services/PaginationService';

export default interface ITeamsRepository {
  insertTeam(team: ITeamDoc): Promise<ITeamDoc>;
  updateTeam(id: ObjectID, team: ITeamDoc): Promise<ITeamDoc>;
  deleteTeam(id: ObjectID): Promise<ITeamDoc>;
  getTeams(
    name: string,
    limit: number,
    page: number
  ): Promise<PaginationResult>;
  getTeamById(id: ObjectID): Promise<ITeamDoc>;
}
