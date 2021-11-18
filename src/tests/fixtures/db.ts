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

export const setupUserDatabase = async () => {
  await User.deleteMany();
  await Team.deleteMany();
  try {
    const userOneDoc = await new User(userOne).save();
    const userOneToken = userOneDoc.generateAccessToken();

    const userTwoDoc = await new User(userTwo).save();
    const userTwoToken = userTwoDoc.generateAccessToken();

    return { userOneToken, userTwoToken };
  } catch (error) {
    throw new Error('no file');
  }
};

export const setupTeamDatabase = async () => {
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

    const team = await new Team(teamOne).save();
    return { team };
  } catch (error) {
    throw new Error('no file');
  }
};

export const setupTeamListDatabase = async () => {
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

    const teamList: ITeamDoc[] = [];
    for (let index = 1; index < 33; index++) {
      teamList.push({
        name: `${index}`,
        nameDisplay: `${index}`,
        permalink: `${index}`,
        flagIcon: targetFilePath,
      });
    }

    const teams = await Team.insertMany(teamList);
    return teams;
  } catch (error) {
    throw new Error('no file');
  }
};
