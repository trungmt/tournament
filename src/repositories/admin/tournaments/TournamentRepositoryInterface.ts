import { HydratedDocument } from 'mongoose';
import { PaginationResult } from '../../../services/PaginationService';

export default interface TournamentRepositoryInterface {
  insertTournament(
    tournament: ITournamentDoc
  ): Promise<RepositoryResultType<ITournamentDoc> | null>;
  updateTournament(
    _id: string,
    tournament: ITournamentDoc
  ): Promise<RepositoryResultType<ITournamentDoc> | null>;
  deleteTournament(
    _id: string
  ): Promise<RepositoryResultType<ITournamentDoc> | null>;
  getTournaments(
    query: string,
    limit: string,
    page: string
  ): Promise<PaginationResult<RepositoryResultType<ITournamentDoc>>>;
  getTournamentById(
    id: string
  ): Promise<RepositoryResultType<ITournamentDoc> | null>;
}
