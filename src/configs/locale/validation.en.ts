type EntityLocale<T> = {
  label: { [P in keyof T]: string };
};
const team: EntityLocale<ITeam> = {
  label: {
    name: 'Name',
    shortName: 'Short Name',
    permalink: 'Permalink',
    flagIcon: 'Flag Icon',
  },
};

const tournament: EntityLocale<ITournament> = {
  label: {
    name: 'Name',
    permalink: 'Permalink',
    groupStageEnable: 'Tournament Type',
    groupStageType: 'Group Stage Type',
    groupStageGroupSize: 'Number of participants in each group',
    groupStageGroupAdvancedSize:
      'Number of participants advanced from each group',
    groupStageRoundRobinType: 'Participants play each other',
    finalStageType: 'Final Stage Type',
    finalStageRoundRobinType: 'Participants play each other',
    finalStageSingleBronzeEnable: 'Include a match for 3rd place',
  },
};

const validationMessage = {
  required: '%s is a required field',
  duplicate: '%s value is already existed',
  permalinkPattern: '%s only accepts alphanumeric connected by dash',
  invalidUploadFilepath: 'Invalid %s file path',
  emptyUploadFile: '%s file is empty',
  lessThan: '%s must be less than %s',
  powerOf2: '%s must be a power of 2 (1,2,4,8,16,...)',
  fileTooLarge: 'File too large',
  notAllowFileType:
    'File type not allowed. Please upload image with these types: %s',
  positive: '%s must be a positive number',
  max: '%s must be less than or equal to %s',
  notAllowStageType: '%s have to be one of these types: %s',
};

const validationLocaleEn = {
  team,
  tournament,
  validationMessage,
};

export default validationLocaleEn;
