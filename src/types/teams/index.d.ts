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

type IDoc = IGroupDoc | ITeamDoc;
