import PaginationService from '../../services/PaginationService';

describe('constructor', () => {
  let defaultPaginLimit = parseInt(process.env.PAGINATION_DEFAULT_LIMIT!);
  let defaultPaginPage = parseInt(process.env.PAGINATION_DEFAULT_PAGE!);

  test('limit = NaN string should return default limit', () => {
    const paginationService = new PaginationService('string', 2);
    expect(paginationService.limit).toBe(defaultPaginLimit);
  });

  test('limit = undefined should return default limit', () => {
    const paginationService = new PaginationService(undefined, 3);
    expect(paginationService.limit).toBe(defaultPaginLimit);
  });

  test('limit = 0 should return default limit', () => {
    const paginationService = new PaginationService(0, 3);
    expect(paginationService.limit).toBe(defaultPaginLimit);
  });

  test('limit < 0 should return default limit', () => {
    const paginationService = new PaginationService(-1, 3);
    expect(paginationService.limit).toBe(defaultPaginLimit);
  });

  test('limit > 0 should return default limit', () => {
    const paginationService = new PaginationService(5, 3);
    expect(paginationService.limit).toBe(5);
  });

  test('limit > 0 should return default limit', () => {
    const paginationService = new PaginationService('5', 3);
    expect(paginationService.limit).toBe(5);
  });

  test('page = NaN string should return default page', () => {
    const paginationService = new PaginationService(10, 'string');
    expect(paginationService.page).toBe(defaultPaginPage);
  });

  test('page = undefined should return default page', () => {
    const paginationService = new PaginationService(10, undefined);
    expect(paginationService.page).toBe(defaultPaginPage);
  });

  test('page = 0 should return default page', () => {
    const paginationService = new PaginationService(10, 0);
    expect(paginationService.page).toBe(defaultPaginPage);
  });

  test('page < 0 should return default page', () => {
    const paginationService = new PaginationService(10, -1);
    expect(paginationService.page).toBe(defaultPaginPage);
  });

  test('page > 0 should return default page', () => {
    const paginationService = new PaginationService(10, 5);
    expect(paginationService.page).toBe(5);
  });

  test('limit > 0 should return default limit', () => {
    const paginationService = new PaginationService(10, '5');
    expect(paginationService.page).toBe(5);
  });

  test('test regular input for offset calculating', () => {
    const paginationService = new PaginationService(2, 3);
    expect(paginationService.limit).toBe(2);
    expect(paginationService.offset).toBe(4);
    expect(paginationService.page).toBe(3);
  });
});

describe('paginate', () => {
  const data = Array.from({ length: 10 }, (_, i) => i + 1);
  let defaultPaginLimit = parseInt(process.env.PAGINATION_DEFAULT_LIMIT!);
  let defaultPaginPage = parseInt(process.env.PAGINATION_DEFAULT_PAGE!);

  test('Should return first page with undefined limit, page', () => {
    const paginationService = new PaginationService();
    const count = 32;
    const sut = paginationService.paginate(data, count);

    const expectResult = {
      results: data,
      count,
      current: 1,
      lastPage: 4,
      limit: defaultPaginLimit,
      previous: null,
      next: 2,
    };
    expect(sut).toEqual(expectResult);
  });

  test('Should list teams with previous and next page', () => {
    const paginationService = new PaginationService(5, 2);
    const count = 32;
    const sut = paginationService.paginate(data, count);

    const expectResult = {
      results: data,
      count,
      current: 2,
      lastPage: 7,
      limit: 5,
      previous: 1,
      next: 3,
    };
    expect(sut).toEqual(expectResult);
  });

  test('Should list last page', () => {
    const paginationService = new PaginationService(5, 7);
    const count = 32;
    const sut = paginationService.paginate(data, count);

    const expectResult = {
      results: data,
      count,
      current: 7,
      lastPage: 7,
      limit: 5,
      previous: 6,
      next: null,
    };
    expect(sut).toEqual(expectResult);
  });

  test('Should list nothing because out of page range', () => {
    const paginationService = new PaginationService(10, 5);
    const count = 32;
    const sut = paginationService.paginate(data, count);

    const expectResult = {
      results: data,
      count,
      current: null,
      lastPage: 4,
      limit: 10,
      previous: null,
      next: null,
    };
    expect(sut).toEqual(expectResult);
  });
});
