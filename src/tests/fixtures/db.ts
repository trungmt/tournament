import fs from 'fs';
import { Types } from 'mongoose';
import User, { IUser } from '../../models/user';
import Team, { ITeam } from '../../models/team';

export const userOne: IUser = {
  username: 'trungtm',
  name: 'Trung Tran',
  password: 'abcd1234',
};

export const userTwo: IUser = {
  username: 'trungtm1',
  name: ' Tran Minh Trung ',
  password: 'abcd1234!',
};

let flagIconBuffer: Buffer;
try {
  flagIconBuffer = fs.readFileSync(
    'src/tests/fixtures/images/teams/england.jpg'
  );
} catch (error) {
  throw new Error('no file');
}
export const teamOne: ITeam = {
  name: 'England',
  permalink: 'england',
  flagIcon: flagIconBuffer,
};

export const setupDatabase = async () => {
  await User.deleteMany();
  await Team.deleteMany();

  const userOneDoc = await new User(userOne).save();
  const userOneToken = userOneDoc.generateAccessToken();

  const userTwoDoc = await new User(userTwo).save();
  const userTwoToken = userTwoDoc.generateAccessToken();

  await new Team(teamOne).save();

  return { userOneToken, userTwoToken };
};
