import request from 'supertest';
import app from '../app';
import { setupDatabase } from './fixtures/db';
import { removeOldTempFiles } from '../middlewares/upload';
import Team from '../models/team';

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
});

// describe('POST /api/admin/teams', () => {
//   test('Should not create new team for unauthorized user', async () => {
//     await request(app)
//       .post(createTeamURL)
//       .set('Connection', 'keep-alive')
//       .field({
//         name: 'Italy',
//         permalink: 'Italy',
//       })
//       .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
//       .expect(401);
//   });

//   test('Should not create new team missing name', async () => {
//     const response = await request(app)
//       .post(createTeamURL)
//       .set('Authorization', `Bearer ${userOneToken}`)
//       .set('Connection', 'keep-alive')
//       .field({
//         permalink: 'italy',
//       })
//       .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
//       .expect(400);

//     expect(response.body.name).toBe('ValidationError');
//     expect(response.body.errors.name.properties).toMatchObject({
//       message: 'Path `name` is required.',
//       type: 'required',
//       path: 'name',
//     });
//   });

//   test('Should not create new team missing permalink', async () => {
//     const response = await request(app)
//       .post(createTeamURL)
//       .set('Authorization', `Bearer ${userOneToken}`)
//       .set('Connection', 'keep-alive')
//       .field({
//         name: 'Italy',
//       })
//       .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
//       .expect(400);

//     expect(response.body.name).toBe('ValidationError');
//     expect(response.body.errors.permalink.properties).toMatchObject({
//       message: 'Path `permalink` is required.',
//       type: 'required',
//       path: 'permalink',
//     });
//   });

//   describe('Should not create new team with wrong permalink pattern', () => {
//     test('Permalink with dash first', async () => {
//       const dashFirstPermalink = '-abc-abc';
//       const response = await request(app)
//         .post(createTeamURL)
//         .set('Authorization', `Bearer ${userOneToken}`)
//         .set('Connection', 'keep-alive')
//         .field({
//           name: 'Italy',
//           permalink: dashFirstPermalink,
//         })
//         .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
//         .expect(400);

//       expect(response.body.name).toBe('ValidationError');
//       expect(response.body.errors.permalink.properties.message).toBe(
//         'Permalink only accepts alphanumeric and dash'
//       );
//     });

//     test('Permalink with special chars', async () => {
//       const specialcharsPermalink = 'abc-`~!@#$%^&*()+=|}{[]';
//       const response = await request(app)
//         .post(createTeamURL)
//         .set('Authorization', `Bearer ${userOneToken}`)
//         .set('Connection', 'keep-alive')
//         .field({
//           name: 'Italy',
//           permalink: specialcharsPermalink,
//         })
//         .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
//         .expect(400);

//       expect(response.body.name).toBe('ValidationError');
//       expect(response.body.errors.permalink.properties.message).toBe(
//         'Permalink only accepts alphanumeric and dash'
//       );
//     });
//   });

//   describe('Should not create new team because of duplicating', () => {
//     test('Duplicate in name', async () => {
//       const response = await request(app)
//         .post(createTeamURL)
//         .set('Authorization', `Bearer ${userOneToken}`)
//         .set('Connection', 'keep-alive')
//         .field({
//           name: 'England',
//           permalink: 'something',
//         })
//         .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
//         .expect(400);

//       expect(response.body.code).toBe(11000);
//     });

//     test('Duplicate in name', async () => {
//       const response = await request(app)
//         .post(createTeamURL)
//         .set('Authorization', `Bearer ${userOneToken}`)
//         .set('Connection', 'keep-alive')
//         .field({
//           name: 'something',
//           permalink: 'england',
//         })
//         .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
//         .expect(400);

//       expect(response.body.code).toBe(11000);
//     });
//   });

//   test('Should create a new team', async () => {
//     const name = 'Czech Republic';
//     const permalink = 'Czech-Republic';

//     const response = await request(app)
//       .post(createTeamURL)
//       .set('Authorization', `Bearer ${userOneToken}`)
//       .set('Connection', 'keep-alive')
//       .field({
//         name,
//         permalink,
//       })
//       .attach('flagIcon', 'src/tests/fixtures/images/teams/england.jpg')
//       .expect(201);

//     // confirm that team has been inserted
//     const team = await Team.findById(response.body._id);
//     expect(team).not.toBeNull();
//     expect(team!.nameDisplay).toBe(name.trim());
//     expect(team!.permalink).toBe(permalink.toLowerCase());
//     expect(team!.flagIcon).toBeTruthy();
//   });
// });
