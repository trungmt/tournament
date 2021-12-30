import { ObjectID } from 'mongodb';
import { Document, FilterQuery, Types } from 'mongoose';
import { PaginationResult } from '../../../services/PaginationService';
import TournamentModel, { ITournamentModel } from '../../../models/tournament';
import TournamentRepositoryInterface from './TournamentRepositoryInterface';
import Repository from '../Repository';

export default class TournamentRepository
  extends Repository<ITournamentDoc, {}>
  implements TournamentRepositoryInterface
{
  constructor(model: ITournamentModel = TournamentModel) {
    super(model);
  }
  async insertTournament(
    tournament: ITournamentDoc
  ): Promise<RepositoryResultType<ITournamentDoc> | null> {
    return await this.model.create(tournament);
  }
  async updateTournament(
    _id: string,
    tournament: ITournamentDoc
  ): Promise<RepositoryResultType<ITournamentDoc> | null> {
    const isValidId = ObjectID.isValid(_id);
    if (isValidId === false) {
      return null;
    }

    return await this.model.findOneAndUpdate({ _id }, tournament, {
      runValidators: true,
    });
  }
  deleteTournament(
    _id: string
  ): Promise<RepositoryResultType<ITournamentDoc> | null> {
    throw new Error('Method not implemented.');
  }
  async getTournaments(
    query: string = '',
    limit: string,
    page: string
  ): Promise<PaginationResult<RepositoryResultType<ITournamentDoc>>> {
    const filter: FilterQuery<RepositoryResultType<ITeamDoc>> = {
      name: { $regex: '.*' + query + '.*', $options: 'i' },
    };
    const sort = { createdAt: -1, _id: -1 };

    return await this.getListWithPagination(filter, sort, limit, page);
  }
  async getTournamentById(
    _id: string
  ): Promise<RepositoryResultType<ITournamentDoc> | null> {
    const isValidId = ObjectID.isValid(_id);
    if (isValidId === false) {
      return null;
    }
    return await this.model.findById(_id);
  }
}
