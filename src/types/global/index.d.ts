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

interface ITournamentDoc extends ITournament {
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
interface ITeamDoc extends ITeam {
  nameDisplay: string;
  shortNameDisplay: string;
}

interface IGroup {
  name: string;
  permalink: string;
  flagIcon: string;
}
interface IGroupDoc extends IGroup {
  nameDisplay: string;
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

type IDoc = ITournamentDoc | IGroupDoc | ITeamDoc;

type RepositoryResultType<T extends IDoc> = import('mongoose').HydratedDocument<
  T,
  {}
>;
