import request from 'supertest';
import { userOne, setupUserDatabase } from './fixtures/db';
import app from '../app';

let userOneToken: string;
beforeEach(async () => {
  const initDBResult = await setupUserDatabase();
  userOneToken = initDBResult.userOneToken;
});

const basicAPIURL = '/api/v1';
const authAPIURL = `${basicAPIURL}/auth`;
const registerURL = `${authAPIURL}/register`;

test('Should sign up user', async () => {
  const response = await request(app)
    .post(registerURL)
    .field({
      name: 'Tran Minh Trung',
      username: 'trungtm2',
      password: 'abcd1234!',
    })
    .attach('avatar', 'src/tests/fixtures/images/users/user.jpg')
    .expect(201);
});
