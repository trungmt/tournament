import request from 'supertest';
import { userOne, userOneId, setupDatabase } from './fixtures/db';
import app from '../app';

let userOneToken: string;
beforeEach(async () => {
  const initDBResult = await setupDatabase();
  userOneToken = initDBResult.userOneToken;
});

test('Should sign up user', async () => {
  const response = await request(app)
    .post('/auth/register')
    .send({
      name: 'Tran Minh Trung',
      username: 'trungtm2',
      password: 'abcd1234!',
    })
    .expect(201);
});