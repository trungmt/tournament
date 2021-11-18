import request from 'supertest';
import { Document } from 'mongoose';
import app from '../app';
import {
  setupUserDatabase,
  setupTeamDatabase,
  setupTeamListDatabase,
} from './fixtures/db';
import { removeOldTempFiles } from '../services/FileService';
import Team from '../models/team';
import { ObjectID } from 'mongodb';

// TODO: add locale files to store constants related to validation messages

let userOneToken: string;
let userTwoToken: string;
let team: ITeamDoc & Document<any, any, ITeamDoc>;

beforeEach(async () => {
  const initUserDBResult = await setupUserDatabase();
  const initTeamDBResult = await setupTeamDatabase();
  userOneToken = initUserDBResult.userOneToken;
  userTwoToken = initUserDBResult.userTwoToken;
  team = initTeamDBResult.team;
});

afterAll(async () => {
  await removeOldTempFiles(0);
});

const createTeamURL = '/api/admin/teams';
const uploadFlagIconURL = '/api/admin/teams/upload/flagIcon';
const deleteTeamURL = '/api/admin/teams/:id';
const listTeamURL = '/api/admin/teams';

describe(`POST ${uploadFlagIconURL}`, () => {
  test('Should not upload flagIcon for unauthorized user', async () => {
    await request(app)
      .post(uploadFlagIconURL)
      // with attach(), test run inconsistently,
      // sometimes there are failed testcase with `read ECONNRESET` or `write ECONNABORTED` errors
      .set('Connection', 'keep-alive')
      .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
      .expect(401);
  });

  // TODO: check if file exist in fixtures/images/...
  test('Should response error in case no file attached', async () => {
    const response = await request(app)
      .post(uploadFlagIconURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .expect(422);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.data.flagIcon).toBe('Flag Icon is a required field');
  });

  test('Should response error in case empty file attached', async () => {
    const response = await request(app)
      .post(uploadFlagIconURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .attach('flagIcon', 'src/tests/fixtures/images/teams/england_empty.jpg')
      .expect(422);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.data.flagIcon).toBe('Flag Icon file is empty.');
  });

  test('Should response error in case upload file with exceed filesize', async () => {
    const response = await request(app)
      .post(uploadFlagIconURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .attach('flagIcon', 'src/tests/fixtures/images/teams/england_large.jpg')
      .expect(422);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.data.flagIcon).toBe('File too large');
  });

  test('Should response error in case upload file with wrong extension', async () => {
    const response = await request(app)
      .post(uploadFlagIconURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .attach('flagIcon', 'src/tests/fixtures/images/teams/england.txt')
      .expect(422);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.data.flagIcon).toBe(
      'File type not allowed. Please upload image with these types: jpg, jpeg, png, gif, tiff'
    );
  });

  test('Should upload flagIcon', async () => {
    const response = await request(app)
      .post(uploadFlagIconURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
      .expect(201);
  });
});

describe('POST /api/admin/teams', () => {
  let flagIcon: string = '';
  beforeEach(async () => {
    const responseUploadFlagIcon = await request(app)
      .post(uploadFlagIconURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg');

    flagIcon = responseUploadFlagIcon.body.data.filename;
  });

  test('Should not create new team for unauthorized user', async () => {
    await request(app)
      .post(createTeamURL)
      .set('Connection', 'keep-alive')
      .send({
        name: 'Italy',
        permalink: 'Italy',
        flagIcon,
      })
      .expect(401);
  });

  test('Should not create new team missing name', async () => {
    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send({
        permalink: 'italy',
        flagIcon,
      })
      .expect(422);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.data.name).toBe('Name is a required field');
  });

  test('Should not create new team missing permalink', async () => {
    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send({
        name: 'Italy',
        flagIcon,
      })
      .expect(422);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.data.permalink).toBe('Permalink is a required field');
  });

  describe('Should not create new team with wrong permalink pattern', () => {
    test('Permalink with dash first', async () => {
      const dashFirstPermalink = '-abc-abc';
      const response = await request(app)
        .post(createTeamURL)
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send({
          name: 'Italy',
          permalink: dashFirstPermalink,
          flagIcon,
        })
        .expect(422);

      expect(response.body.name).toBe('ValidationError');
      expect(response.body.data.permalink).toBe(
        'Permalink only accepts alphanumeric and dash'
      );
    });

    test('Permalink with special chars', async () => {
      const specialcharsPermalink = 'abc-`~!@#$%^&*()+=|}{[]';
      const response = await request(app)
        .post(createTeamURL)
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send({
          name: 'Italy',
          permalink: specialcharsPermalink,
          flagIcon,
        })
        .expect(422);

      expect(response.body.name).toBe('ValidationError');
      expect(response.body.data.permalink).toBe(
        'Permalink only accepts alphanumeric and dash'
      );
    });
  });

  describe('Should not create new team because of duplicating', () => {
    test('Duplicate in name', async () => {
      const response = await request(app)
        .post(createTeamURL)
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send({
          name: 'England',
          permalink: 'something',
          flagIcon,
        })
        .expect(422);

      expect(response.body.name).toBe('ValidationError');
      expect(response.body.data.name).toBe('Name value is already existed');
    });

    test('Duplicate in permalink', async () => {
      const response = await request(app)
        .post(createTeamURL)
        .set('Authorization', `Bearer ${userOneToken}`)
        .set('Connection', 'keep-alive')
        .send({
          name: 'something',
          permalink: 'england',
        })
        .expect(422);

      expect(response.body.name).toBe('ValidationError');
      expect(response.body.data.permalink).toBe(
        'Permalink value is already existed'
      );
    });
  });

  test('Should not create new team missing flagIcon', async () => {
    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send({
        name: 'Italy',
        permalink: 'italy',
      })
      .expect(422);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.data.flagIcon).toBe('Flag Icon is a required field');
  });

  test('Should not create new team with not exists flagIcon filename', async () => {
    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send({
        name: 'Italy',
        permalink: 'italy',
        flagIcon: 'not-exists.jpg',
      })
      .expect(422);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.data.flagIcon).toBe('Invalid Flag Icon file path');
  });

  test('Should create a new team', async () => {
    const name = 'Czech Republic';
    const permalink = 'Czech-Republic';

    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send({
        name,
        permalink,
        flagIcon,
      })
      .expect(201);

    // confirm that team has been inserted
    const team = await Team.findById(response.body._id);
    expect(team).not.toBeNull();
    expect(team!.nameDisplay).toBe(name.trim());
    expect(team!.permalink).toBe(permalink.toLowerCase());
    expect(team!.flagIcon).toBeTruthy();
  });
});

describe(`DELETE ${deleteTeamURL}`, () => {
  let _idString: string;
  beforeEach(() => {
    const _id = team._id as ObjectID;
    _idString = _id.toHexString();
  });
  test(`Should delete team`, async () => {
    const url = deleteTeamURL.replace(':id', _idString);
    console.log('url', url);
    const response = await request(app)
      .delete(url)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);
    expect(response.body._id).toBe(_idString);
  });

  test(`Should response not found error if delete team that doesnt exist in db`, async () => {
    const _idString = '6166fc792d145d5b4ceb43ba'; // ObjectID from past
    const url = deleteTeamURL.replace(':id', _idString);
    console.log('url', url);
    const response = await request(app)
      .delete(url)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(404);
  });

  test('Should not delete team for unauthorized user', async () => {
    const url = deleteTeamURL.replace(':id', _idString);
    console.log('url', url);
    const response = await request(app)
      .delete(url)
      .set('Connection', 'keep-alive')
      .send()
      .expect(401);
  });
});

describe(`GET ${listTeamURL}`, () => {
  let teamList: ITeamDoc[];
  let defaultPaginLimit = parseInt(process.env.PAGINATION_DEFAULT_LIMIT!);
  let defaultPaginPage = parseInt(process.env.PAGINATION_DEFAULT_PAGE!);
  console.log('defaultPaginLimit', defaultPaginLimit);
  beforeEach(async () => {
    const initTeamListDBResult = await setupTeamListDatabase();
    teamList = initTeamListDBResult;
  });
  test(`Should list first page teams in default url`, async () => {
    const expectTeamList = teamList
      .slice(teamList.length - defaultPaginLimit)
      .reverse();
    const response = await request(app)
      .get(listTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const resultTeams = response.body.results as ITeamDoc[];

    expect(resultTeams.length).toBe(defaultPaginLimit);
    expect(resultTeams).toEqual(JSON.parse(JSON.stringify(expectTeamList)));
    expect(response.body.current).toBe(defaultPaginPage);
    expect(response.body.limit).toBe(defaultPaginLimit);
    expect(response.body.lastPage).toBe(4);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toBe(2);
  });

  test(`Should list first page teams if no limit and page specified`, async () => {
    const expectTeamList = teamList
      .slice(teamList.length - defaultPaginLimit)
      .reverse();
    const response = await request(app)
      .get(`${listTeamURL}?limit=&page=`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const resultTeams = response.body.results as ITeamDoc[];

    expect(resultTeams.length).toBe(defaultPaginLimit);
    expect(resultTeams).toEqual(JSON.parse(JSON.stringify(expectTeamList)));
    expect(response.body.current).toBe(defaultPaginPage);
    expect(response.body.limit).toBe(defaultPaginLimit);
    expect(response.body.lastPage).toBe(4);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toBe(2);
  });

  test(`Should list teams with previous and next page`, async () => {
    const limit = 2,
      page = 3;
    const response = await request(app)
      .get(`${listTeamURL}?limit=${limit}&page=${page}`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const expectTeamList = teamList
      .slice(teamList.length - 6, teamList.length - 4)
      .reverse();
    const resultTeams = response.body.results as ITeamDoc[];

    expect(resultTeams.length).toBe(limit);
    expect(resultTeams).toEqual(JSON.parse(JSON.stringify(expectTeamList)));
    expect(response.body.current).toBe(page);
    expect(response.body.limit).toBe(limit);
    expect(response.body.lastPage).toBe(16);
    expect(response.body.previous).toBe(page - 1);
    expect(response.body.next).toBe(page + 1);
  });

  test(`Should list last page`, async () => {
    const page = 4;
    const response = await request(app)
      .get(`${listTeamURL}?limit=&page=${page}`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const expectTeamList = teamList.slice(0, 2).reverse();
    const resultTeams = response.body.results as ITeamDoc[];
    expect(resultTeams.length).toBe(2);
    expect(resultTeams).toEqual(JSON.parse(JSON.stringify(expectTeamList)));
    expect(response.body.current).toBe(page);
    expect(response.body.limit).toBe(defaultPaginLimit);
    expect(response.body.lastPage).toBe(4);
    expect(response.body.previous).toBe(page - 1);
    expect(response.body.next).toBeNull();
  });

  test(`Should list nothing because out of page range`, async () => {
    const page = 10;
    const response = await request(app)
      .get(`${listTeamURL}?limit=&page=${page}`)
      .set('Authorization', `Bearer ${userOneToken}`)
      .set('Connection', 'keep-alive')
      .send()
      .expect(200);

    const expectTeamList = [] as ITeamDoc[];
    const resultTeams = response.body.results as ITeamDoc[];
    expect(resultTeams.length).toBe(0);
    expect(resultTeams).toEqual(JSON.parse(JSON.stringify(expectTeamList)));
    expect(response.body.current).toBeNull();
    expect(response.body.limit).toBe(defaultPaginLimit);
    expect(response.body.lastPage).toBe(4);
    expect(response.body.previous).toBeNull();
    expect(response.body.next).toBeNull();
  });
});
