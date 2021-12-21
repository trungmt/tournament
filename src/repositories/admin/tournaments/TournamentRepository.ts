import { ObjectID } from 'mongodb';
import { PaginationResult } from '../../../services/PaginationService';
import TournamentModel, { ITournamentModel } from '../../../models/tournament';
import TournamentRepositoryInterface from './TournamentRepositoryInterface';
import Repository from '../Repository';
import { Document, FilterQuery, Types } from 'mongoose';

export default class TournamentRepository
  extends Repository<ITournamentDoc, {}>
  implements TournamentRepositoryInterface
{
  constructor(model: ITournamentModel = TournamentModel) {
    super(model);
  }
  insertTournament(
    tournament: ITournamentDoc
  ): Promise<
    | (Document<any, any, ITournamentDoc> &
        ITournamentDoc & { _id: Types.ObjectId })
    | null
  > {
    throw new Error('Method not implemented.');
  }
  updateTournament(
    _id: string,
    tournament: ITournamentDoc
  ): Promise<
    | (Document<any, any, ITournamentDoc> &
        ITournamentDoc & { _id: Types.ObjectId })
    | null
  > {
    throw new Error('Method not implemented.');
  }
  deleteTournament(
    _id: string
  ): Promise<
    | (Document<any, any, ITournamentDoc> &
        ITournamentDoc & { _id: Types.ObjectId })
    | null
  > {
    throw new Error('Method not implemented.');
  }
  getTournaments(
    query: string,
    limit: string,
    page: string
  ): Promise<
    PaginationResult<
      Document<any, any, ITournamentDoc> &
        ITournamentDoc & { _id: Types.ObjectId }
    >
  > {
    throw new Error('Method not implemented.');
  }
  getTournamentById(
    id: string
  ): Promise<
    | (Document<any, any, ITournamentDoc> &
        ITournamentDoc & { _id: Types.ObjectId })
    | null
  > {
    throw new Error('Method not implemented.');
  }
}
