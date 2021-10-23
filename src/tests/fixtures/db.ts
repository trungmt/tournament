import User, { IUser } from '../../models/user';
import Team from '../../models/team';
import { moveUploadFile } from '../../services/FileService';

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

export const setupDatabase = async () => {
  await User.deleteMany();
  await Team.deleteMany();

  const fileName = 'england.jpg';
  const flagIconWidth = parseInt(process.env.DEFAULT_IMAGE_WIDTH!);
  try {
    const targetFilePath = await moveUploadFile(
      process.env.ENTITY_TEAMS!,
      fileName,
      flagIconWidth,
      false
    );

    const teamOne: ITeamDoc = {
      name: 'england',
      nameDisplay: 'England',
      permalink: 'england',
      flagIcon: targetFilePath,
    };

    const userOneDoc = await new User(userOne).save();
    const userOneToken = userOneDoc.generateAccessToken();

    const userTwoDoc = await new User(userTwo).save();
    const userTwoToken = userTwoDoc.generateAccessToken();

    const team = await new Team(teamOne).save();
    return { userOneToken, userTwoToken, team };
  } catch (error) {
    throw new Error('no file');
  }
};
