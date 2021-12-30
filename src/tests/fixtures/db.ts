import User, { IUser } from '../../models/user';
import Team from '../../models/team';
import Tournament from '../../models/tournament';
import { moveUploadFile } from '../../services/FileService';
import { RoundRobinType, StageType } from '../../types/global';

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
      shortName: 'eng',
      shortNameDisplay: 'ENG',
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
        shortName: `${index}`,
        shortNameDisplay: `${index}`,
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

export const groupDisabledtournamentForm: ITournamentForm = {
  name: 'euro 2021',
  permalink: 'euro-2021',
  groupStageEnable: false,
  groupStageGroupSize: null,
  groupStageGroupAdvancedSize: null,
  groupStageType: null,
  groupStageRoundRobinType: null,
  finalStageType: StageType.SingleElimination,
  finalStageRoundRobinType: null,
  finalStageSingleBronzeEnable: false,
};

export const groupEnabledTournamentForm: ITournamentForm = {
  name: 'The international 2021',
  permalink: 'the-international-2021',
  groupStageEnable: true,
  groupStageGroupSize: 4,
  groupStageGroupAdvancedSize: 2,
  groupStageType: StageType.RoundRobin,
  groupStageRoundRobinType: RoundRobinType.Once,
  finalStageType: StageType.SingleElimination,
  finalStageRoundRobinType: null,
  finalStageSingleBronzeEnable: false,
};

export const setupTournamentDatabase = async () => {
  await Tournament.deleteMany();

  try {
    const tournamentOne: ITournamentDoc = {
      name: 'euro 2021',
      nameDisplay: 'Euro 2021',
      permalink: 'euro-2021',
      groupStageEnable: false,
      groupStageGroupSize: null,
      groupStageGroupAdvancedSize: null,
      groupStageType: null,
      groupStageRoundRobinType: null,
      finalStageType: StageType.SingleElimination,
      finalStageRoundRobinType: null,
      finalStageSingleBronzeEnable: false,
    };

    const tournament = await new Tournament(tournamentOne).save();
    return { tournament };
  } catch (error) {
    throw new Error('Error setupTournamentDatabase');
  }
};

export const setupTournamentListDatabase = async () => {
  await Tournament.deleteMany();

  const tournamentList: ITournamentDoc[] = [];
  for (let index = 1; index < 33; index++) {
    tournamentList.push({
      ...groupDisabledtournamentForm,
      name: `${index}`,
      permalink: `${index}`,
    });
  }

  const tournaments = await Tournament.insertMany(tournamentList);
  return tournaments;
};
