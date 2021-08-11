import { Types } from 'mongoose';
import User, { IUser } from '../../model/user';
import Team, { ITeamDoc } from '../../model/team';

export const userOneId = new Types.ObjectId();
export const userOne: IUser = {
  _id: userOneId,
  username: 'trungtm',
  name: 'Trung Tran',
  password: 'abcd1234',
};

export const userTwoId = new Types.ObjectId();
export const userTwo: IUser = {
  _id: userTwoId,
  username: 'trungtm1',
  name: ' Tran Minh Trung ',
  password: 'abcd1234!',
};

export const teamOneId = new Types.ObjectId();
export const teamOne: ITeamDoc = {
  _id: teamOneId,
  name: 'England',
  permalink: 'england',
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
