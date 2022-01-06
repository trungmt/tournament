/**
 * *Doc (ex. ITournamentDoc) type/interface used for typehint what will be stored to db
 * *    (ex. ITournament) type/interface used for common typehint, to extend the type for special purpose, like form type
 */
interface IDoc {}
interface ITournament {
  name: string;
  permalink: string;
  groupStageEnable: boolean;
  groupStageType: import('./index').StageType | null;
  groupStageGroupSize: number | null;
  groupStageGroupAdvancedSize: number | null;
  groupStageRoundRobinType: import('./index').RoundRobinType | null;
  finalStageType: import('./index').StageType;
  finalStageRoundRobinType: import('./index').RoundRobinType | null;
  finalStageSingleBronzeEnable: boolean | null;
}
interface ITournamentDoc extends ITournament, IDoc {
  nameDisplay?: string;
}

type ITournamentForm = ITournament;
interface ITournamentBodyForm {
  body: ITournament;
}

interface ITeam {
  name: string;
  shortName: string;
  permalink: string;
  flagIcon: string;
}
interface ITeamDoc extends ITeam, IDoc {
  nameDisplay: string;
  shortNameDisplay: string;
}

type ITeamForm = Omit<ITeam, 'flagIcon'> & {
  flagIconAdd: string;
  flagIconDelete?: string;
};
interface ITeamBodyForm {
  body: ITeamForm;
}

interface ITeamFileForm {
  body: {
    flagIcon?: Express.Multer.File;
  };
}

interface IGroupParticipant {
  teamId: import('mongoose').Schema.Types.ObjectId;
  seed: number;
  win: number;
  lose: number;
  draw: number;
  point: number;
  tiedPoint: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDifference: number;
  // TODO: matches history
}
interface IGroup {
  tournamentId: import('mongoose').Schema.Types.ObjectId;
  name: string;
  isGroupStage: boolean;
}
interface IGroupDoc extends IGroup, IDoc {
  nameValidate: string;
  participants: IGroupParticipant[];
}

type RepositoryResultType<T extends IDoc> = import('mongoose').HydratedDocument<
  T,
  {}
>;
