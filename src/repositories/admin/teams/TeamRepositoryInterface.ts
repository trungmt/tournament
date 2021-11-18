import { ObjectID } from 'mongodb';
import { Document, EnforceDocument } from 'mongoose';
import { PaginationResult } from '../../../services/PaginationService';

export type ResultType = EnforceDocument<ITeamDoc, {}>;
export default interface ITeamsRepository {
  insertTeam(team: ITeamDoc): Promise<ResultType>;
  updateTeam(id: ObjectID, team: ITeamDoc): Promise<ResultType>;
  deleteTeam(id: ObjectID): Promise<ResultType>;
  getTeams(
    name: string,
    limit: string,
    page: string
  ): Promise<PaginationResult<ResultType>>;
  getTeamById(id: ObjectID): Promise<ResultType | null>;
}
