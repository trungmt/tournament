interface ITeam {
  name: string;
  permalink: string;
  flagIcon: string;
}

interface ITeamBodyForm {
  body: ITeam;
}

interface ITeamDoc extends ITeam {
  nameDisplay: string;
}
