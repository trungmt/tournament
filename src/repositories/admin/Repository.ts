import { EnforceDocument, FilterQuery, Model } from 'mongoose';
import PaginationService, {
  PaginationResult,
} from '../../services/PaginationService';

interface ListResultPagination<T = any> {
  data: T[];
  count: number;
}
export default class Repository<T extends IDoc, TM extends {}> {
  private _model: Model<T, {}, TM>;
  constructor(model: Model<T, {}, TM>) {
    this._model = model;
  }

  public get model() {
    return this._model;
  }
  getListWithPagination = async (
    findOption: FilterQuery<T>,
    sortOption: string | any,
    limit?: number | string,
    page?: number | string
  ): Promise<PaginationResult<EnforceDocument<T, TM>>> => {
    const paginationService = new PaginationService(limit, page);

    const query = this._model.find(findOption).sort(sortOption);
    const sourceQuery = query.toConstructor();

    const data = await new sourceQuery()
      .limit(paginationService.limit)
      .skip(paginationService.offset);
    const count = await new sourceQuery().countDocuments();

    return paginationService.paginate(data, count);
  };
}
