import { ObjectID } from 'mongodb';
import { Document, HydratedDocument } from 'mongoose';
import { PaginationResult } from '../../../services/PaginationService';

export default interface TeamsRepositoryInterface {
  insertTeam(team: ITeamDoc): Promise<RepositoryResultType<ITeamDoc> | null>;
  updateTeam(
    _id: string,
    team: ITeamDoc
  ): Promise<RepositoryResultType<ITeamDoc> | null>;
  deleteTeam(_id: string): Promise<RepositoryResultType<ITeamDoc> | null>;
  getTeams(
    query: string,
    limit: string,
    page: string
  ): Promise<PaginationResult<RepositoryResultType<ITeamDoc>>>;
  getTeamById(id: string): Promise<RepositoryResultType<ITeamDoc> | null>;
}
