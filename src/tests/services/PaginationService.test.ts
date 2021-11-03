import PaginationService from '../../services/PaginationService';

describe('getOffsetFromPageLimit', () => {
  let defaultPaginLimit = parseInt(process.env.PAGINATION_DEFAULT_LIMIT!);
  let defaultPaginPage = parseInt(process.env.PAGINATION_DEFAULT_PAGE!);
  let defaultPaginOffset = 0;

  test('regular input', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(2, 3);
    expect(limit).toBe(2);
    expect(offset).toBe(4);
    expect(page).toBe(3);
  });

  test('limit = undefined, page = undefined should return default limit, offset, page', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery();
    expect(limit).toBe(defaultPaginLimit);
    expect(offset).toBe(defaultPaginOffset);
    expect(page).toBe(defaultPaginPage);
  });
  test('limit = undefined, page = 0 should return default limit, offset, page', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(undefined, 0);
    expect(limit).toBe(defaultPaginLimit);
    expect(offset).toBe(defaultPaginOffset);
    expect(page).toBe(defaultPaginPage);
  });
  test('limit = 0, page = undefined should return default limit, offset, page', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(0);
    expect(limit).toBe(defaultPaginLimit);
    expect(offset).toBe(defaultPaginOffset);
    expect(page).toBe(defaultPaginPage);
  });
  test('limit = 0, page = 0 should return default limit, offset, page', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(0, 0);
    expect(limit).toBe(defaultPaginLimit);
    expect(offset).toBe(defaultPaginOffset);
    expect(page).toBe(defaultPaginPage);
  });

  test('limit = undefined, page = 2 should return default limit, offset and page will be calucalated', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(undefined, 2);
    expect(limit).toBe(defaultPaginLimit);
    expect(offset).toBe(10);
    expect(page).toBe(2);
  });
  test('limit = 0, page = 2 should return default limit, offset and page will be calucalated', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(0, 2);
    expect(limit).toBe(defaultPaginLimit);
    expect(offset).toBe(10);
    expect(page).toBe(2);
  });

  test('limit = 2, page = undefined should return calculated offset, page and default limit', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(2);
    expect(limit).toBe(2);
    expect(offset).toBe(defaultPaginOffset);
    expect(page).toBe(defaultPaginPage);
  });

  test('limit = 2, page = 0 should return calculated offset, page and default limit', () => {
    const { limit, offset, page } =
      PaginationService.getLimitOffsetPageFromPaginationQuery(2, 0);
    expect(limit).toBe(2);
    expect(offset).toBe(defaultPaginOffset);
    expect(page).toBe(defaultPaginPage);
  });

  // describe('test doPagin', () => {
  //   test('test', () => {
  //     const name = 'England';
  //     sinon.stub(TeamModel, 'find').returns({
  //       limit: m => {
  //         return {
  //           skip: n => {
  //             return new Promise((resolve, reject) => {
  //               resolve([]);
  //             });
  //           },
  //         };
  //       },
  //     });
  //     // const spy = jest.spyOn(TeamModel, 'find').mockImplementationOnce()
  //   });
  // });
});
