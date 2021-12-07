export interface PaginationResult<T = any> {
  results: T[];
  count: number;
  current: number | null;
  lastPage: number;
  limit: number;
  previous: number | null;
  next: number | null;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
  page: number;
}

export default class PaginationService {
  private _limit: number;
  private _offset: number;
  private _page: number;

  constructor(queryLimit?: string | number, queryPage?: string | number) {
    const { limit, offset, page } = this.getLimitOffsetPageFromPaginationQuery(
      queryLimit,
      queryPage
    );
    this._limit = limit;
    this._offset = offset;
    this._page = page;
  }

  public get limit() {
    return this._limit;
  }
  public get offset() {
    return this._offset;
  }
  public get page() {
    return this._page;
  }

  private getLimitOffsetPageFromPaginationQuery = (
    inputLimit?: string | number,
    inputPage?: string | number
  ): PaginationOptions => {
    const limit: number =
      !!inputLimit && +inputLimit > 0
        ? +inputLimit
        : parseInt(process.env.PAGINATION_DEFAULT_LIMIT!);
    const page: number =
      !!inputPage && +inputPage > 0
        ? +inputPage
        : parseInt(process.env.PAGINATION_DEFAULT_PAGE!);

    // if (typeof inputLimit === 'string' && parseInt(inputLimit) > 0) {
    //   limit = parseInt(inputLimit);
    // }
    // if (typeof inputLimit === 'number' && inputLimit > 0) {
    //   limit = inputLimit;
    // }

    // if (typeof inputPage === 'string' && parseInt(inputPage) > 0) {
    //   page = parseInt(inputPage);
    // }
    // if (typeof inputPage === 'number' && inputPage > 0) {
    //   page = inputPage;
    // }
    const offset = (page - 1) * limit;

    return { limit, offset, page };
  };

  public paginate = <T = any>(
    data: T[],
    count: number
  ): PaginationResult<T> => {
    const limit = this._limit,
      page = this._page;
    const lastPage = Math.ceil(count / limit);
    const current = page <= lastPage ? page : null;
    const previous = page <= lastPage && page - 1 > 0 ? page - 1 : null;
    const next = page < lastPage ? page + 1 : null;
    return {
      results: data,
      count,
      current,
      lastPage,
      limit,
      previous,
      next,
    };
  };
}
