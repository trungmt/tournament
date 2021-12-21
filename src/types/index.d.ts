enum StageType {
  SingleElimination = 1,
  DoubleElimination,
  RoundRobin,
}

enum RoundRobinType {
  Once = 1,
  Twice = 2,
  Thribe = 3,
}

interface ITournament {
  name: string;
  permalink: string;
  groupStageEnable: boolean;
  groupStageType: StageType | null;
  groupStageGroupSize: number | null;
  groupStageGroupAdvancedSize: number | null;
  groupStageRoundRobinType: RoundRobinType | null;
  finalStageType: StageType;
  finalStageRoundRobinType: RoundRobinType;
  finalStageSingleBronzeEnable: boolean;
}

interface ITournamentDoc extends ITournament {
  nameDisplay: string;
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
