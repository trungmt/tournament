import request from 'supertest';
import app from '../app';
import { setupDatabase, userOne, userOneId } from './fixtures/db';
import Team from '../model/team';
import { createTeam } from '../controller/admin/teams';

const createTeamURL = '/api/admin/teams';

let userOneToken: string;
let userTwoToken: string;

beforeEach(async () => {
  const initDBResult = await setupDatabase();
  userOneToken = initDBResult.userOneToken;
  userTwoToken = initDBResult.userTwoToken;
});

test('Should not create new team for unauthorized user', async () => {
  await request(app)
    .post(createTeamURL)
    .send({
      name: 'Italy',
      permalink: 'Italy',
    })
    .expect(401);
});

test('Should not create new team missing name', async () => {
  const response = await request(app)
    .post(createTeamURL)
    .set('Authorization', `Bearer ${userOneToken}`)
    .send({
      permalink: 'italy',
    })
    .expect(400);

  expect(response.body.name).toBe('ValidationError');
  expect(response.body.errors.name.properties).toMatchObject({
    message: 'Path `name` is required.',
    type: 'required',
    path: 'name',
  });
});

test('Should not create new team missing permalink', async () => {
  const response = await request(app)
    .post(createTeamURL)
    .set('Authorization', `Bearer ${userOneToken}`)
    .send({
      name: 'Italy',
    })
    .expect(400);

  expect(response.body.name).toBe('ValidationError');
  expect(response.body.errors.permalink.properties).toMatchObject({
    message: 'Path `permalink` is required.',
    type: 'required',
    path: 'permalink',
  });
});

describe('Should not create new team with wrong permalink pattern', () => {
  test('Permalink with dash first', async () => {
    const dashFirstPermalink = '-abc-abc';
    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        name: 'Italy',
        permalink: dashFirstPermalink,
      })
      .expect(400);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.errors.permalink.properties.message).toBe(
      'Permalink only accepts alphanumeric and dash'
    );
  });

  test('Permalink with special chars', async () => {
    const specialcharsPermalink = 'abc-`~!@#$%^&*()+=|}{[]';
    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        name: 'Italy',
        permalink: specialcharsPermalink,
      })
      .expect(400);

    expect(response.body.name).toBe('ValidationError');
    expect(response.body.errors.permalink.properties.message).toBe(
      'Permalink only accepts alphanumeric and dash'
    );
  });
});

describe('Should not create new team because of duplicating', () => {
  test('Duplicate in name', async () => {
    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        name: 'England',
        permalink: 'something',
      })
      .expect(400);

    expect(response.body.code).toBe(11000);
  });

  test('Duplicate in name', async () => {
    const response = await request(app)
      .post(createTeamURL)
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        name: 'something',
        permalink: 'england',
      })
      .expect(400);

    expect(response.body.code).toBe(11000);
  });
});

test('Should create a new team', async () => {
  const name = 'Czech Republic';
  const permalink = 'Czech-Republic';

  const response = await request(app)
    .post(createTeamURL)
    .set('Authorization', `Bearer ${userOneToken}`)
    .send({
      name,
      permalink,
    })
    .expect(201);

  // confirm that team has been inserted
  const team = await Team.findById(response.body._id);
  expect(team).not.toBeNull();
  expect(team!.name).toBe(name.trim());
  expect(team!.permalink).toBe(permalink.toLowerCase());
});
