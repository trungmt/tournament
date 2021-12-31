const DEFAULT_IMAGE_WIDTH: number = 300;
const DEFAULT_IMAGE_HEIGHT: number = 300;
const ENTITY_TEAMS: string = 'teams';
const ENTITY_USERS: string = 'users';
const ENTITY_TOURNAMENTS: string = 'tournament';
const DEFAULT_IMAGE_SIZE_LIMIT: number = 5242880;
const ACCEPT_IMAGE_EXTENSION: string[] = ['jpg', 'jpeg', 'png', 'gif', 'tiff'];
const PAGINATION_DEFAULT_LIMIT: number = 10;
const PAGINATION_DEFAULT_PAGE: number = 1;
const PERMALINK_VALIDATION_PATTERN: RegExp = /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/;

const globalConstant = {
  DEFAULT_IMAGE_WIDTH,
  DEFAULT_IMAGE_HEIGHT,
  ENTITY_TEAMS,
  ENTITY_USERS,
  ENTITY_TOURNAMENTS,
  DEFAULT_IMAGE_SIZE_LIMIT,
  ACCEPT_IMAGE_EXTENSION,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_DEFAULT_PAGE,
  PERMALINK_VALIDATION_PATTERN,
};

const defaultTeamValues: Partial<ITeam> = {};

const defaultTournamentValues: Partial<ITournament> = {
  groupStageType: null,
  groupStageGroupSize: null,
  groupStageGroupAdvancedSize: null,
  groupStageRoundRobinType: null,
  finalStageRoundRobinType: null,
  finalStageSingleBronzeEnable: null,
};

export const defaultEntityValues = {
  team: defaultTeamValues,
  tournament: defaultTournamentValues,
};
export default globalConstant;
