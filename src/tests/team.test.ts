import request from 'supertest';
import app from '../app';
import { setupDatabase } from './fixtures/db';
import { removeOldTempFiles } from '../middlewares/upload';
import Team from '../models/team';

// TODO: add locale files to store constants related to validation messages
const createTeamURL = '/api/admin/teams';
const uploadFlagIconURL = '/api/admin/teams/upload/flagIcon';

let userOneToken: string;
let userTwoToken: string;

afterAll(async () => {
  await removeOldTempFiles(0);
});

beforeEach(async () => {
  const initDBResult = await setupDatabase();
  userOneToken = initDBResult.userOneToken;
  userTwoToken = initDBResult.userTwoToken;
});

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
