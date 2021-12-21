import { ObjectID } from 'mongodb';
import { Document, HydratedDocument } from 'mongoose';
import { PaginationResult } from '../../../services/PaginationService';

export type ResultType = HydratedDocument<ITeamDoc, {}>;
export default interface ITeamsRepository {
  insertTeam(team: ITeamDoc): Promise<ResultType | null>;
  updateTeam(_id: string, team: ITeamDoc): Promise<ResultType | null>;
  deleteTeam(_id: string): Promise<ResultType | null>;
  getTeams(
    query: string,
    limit: string,
    page: string
  ): Promise<PaginationResult<ResultType>>;
  getTeamById(id: string): Promise<ResultType | null>;
}
