import { QueryWithHelpers } from 'mongoose';

export interface PaginationResult<T = any> {
  results: T[];
  current: number | null;
  lastPage: number;
  limit: number;
  previous: number | null;
  next: number | null;
}

export interface PaginationQueryResult {
  limit: number;
  offset: number;
  page: number;
}

export default class PaginationService {
  public static getLimitOffsetPageFromPaginationQuery = (
    inputLimit?: number,
    inputPage?: number
  ): PaginationQueryResult => {
    const limit = inputLimit || parseInt(process.env.PAGINATION_DEFAULT_LIMIT!);
    const page = inputPage || parseInt(process.env.PAGINATION_DEFAULT_PAGE!);
    const offset = (page - 1) * limit;

    return { limit, offset, page };
  };
  public static doPagination = async <T = any>(
    query: QueryWithHelpers<Array<T>, T>,
    queryLimit?: number,
    queryPage?: number
  ): Promise<PaginationResult<T>> => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(
        queryLimit,
        queryPage
      );
    const sourceQuery = query.toConstructor();
    const data = await new sourceQuery().limit(limit).skip(offset);
    const count = await new sourceQuery().countDocuments();

    const lastPage = Math.ceil(count / limit);
    const current = page <= lastPage ? page : null;
    const previous = page <= lastPage && page - 1 > 0 ? page - 1 : null;
    const next = page < lastPage ? page + 1 : null;
    return {
      results: data,
      current,
      lastPage,
      limit,
      previous,
      next,
    };
  };
}
