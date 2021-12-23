import { Document, FilterQuery } from 'mongoose';
import {
  object,
  string,
  boolean,
  mixed,
  number,
  ref,
  TestFunction,
  SchemaOf,
} from 'yup';
import Tournament from '../models/tournament';
import BaseError from '../exceptions/BaseError';
import {
  isStageTypeRoundRobin,
  isStageTypeSingle,
  isStageTypeDouble,
} from '../services/ValidationService';
import { RoundRobinType, StageType } from '../types/global';

const duplicatePermalinkValidation: TestFunction<
  string | undefined,
  Record<string, any>
> = async function (this, permalink) {
  if (typeof permalink === 'undefined') {
    return true;
  }

  let tournament: (ITournamentDoc & Document<any, any, ITournamentDoc>) | null;
  try {
    // prepare filter, find an existing tournament that has same permalink
    let filter: FilterQuery<ITournamentDoc> = { permalink };

    // in case edit tournament, try to find existing tournament that has same permalink
    // and not current edited tournament
    const _id = this.options.context?._id;
    if (typeof _id !== 'undefined') {
      filter._id = { $ne: _id };
    }

    tournament = await Tournament.findOne(filter);
  } catch (error) {
    // handle system error
    const systemError = new BaseError(
      `Error occurs when validate permalink`,
      '',
      500,
      false
    );

    const nextFunc = this.options.context?.next;
    if (typeof nextFunc !== 'undefined') {
      nextFunc(systemError);
    }
    return false;
  }

  // if there is existing tournament with same permalink, return validation error
  if (tournament) {
    return false;
  }

  return true;
};

const duplicateNameValidation: TestFunction<
  string | undefined,
  Record<string, any>
> = async function (this, name) {
  if (typeof name === 'undefined') {
    return true;
  }

  let tournament: (ITournamentDoc & Document<any, any, ITournamentDoc>) | null;
  try {
    // prepare filter, find an existing tournament that has same name
    let filter: FilterQuery<ITournamentDoc> = { name: name.toLowerCase() };

    // in case edit tournament, try to find existing tournament that has same name
    // and not current edited tournament
    const _id = this.options.context?._id;
    if (typeof _id !== 'undefined') {
      filter._id = { $ne: _id };
    }

    tournament = await Tournament.findOne(filter);
  } catch (error) {
    // handle system error
    const systemError = new BaseError(
      `Error occurs when validate name`,
      '',
      500,
      false
    );

    const nextFunc = this.options.context?.next;
    if (typeof nextFunc !== 'undefined') {
      nextFunc(systemError);
    }
    return false;
  }

  // if there is existing tournament with same name, return validation error
  if (tournament) {
    return false;
  }

  return true;
};

const numberOnlyPowerOf2Validation: TestFunction<
  number | undefined,
  Record<string, any>
> = async function (this, value) {
  if (typeof value === 'undefined') {
    return true;
  }
  return Math.log2(value) % 1 === 0;
};

// NOTE:(message function - https://github.com/sideway/joi/blob/83092836583a7f4ce16cbf116b8776737e80d16f/test/base.js#L1920)
export const tournamentFieldValidationSchema = (
  isUpdate: boolean = false
): SchemaOf<ITournamentBodyForm> =>
  object({
    body: object({
      name: string()
        .required()
        .label('Name')
        .test(
          'duplicateNameValidation',
          '${label} value is already existed',
          duplicateNameValidation
        ),
      permalink: string()
        .required()
        .matches(
          /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/,
          '${label} only accepts alphanumeric connected by dash'
        )
        .lowercase()
        .label('Permalink')
        .test(
          'duplicatePermalinkValidation',
          '${label} value is already existed',
          duplicatePermalinkValidation
        ),
      groupStageEnable: boolean().required().label('Tournament Type'),
      groupStageType: mixed<StageType | null>()
        .default(StageType.RoundRobin)
        .label('Group Stage Type')
        .when('groupStageEnable', {
          is: (groupStageEnableVal: boolean) => groupStageEnableVal === true,
          then: mixed<StageType>().required(),
          otherwise: mixed<StageType>().default(null),
        }),
      groupStageGroupSize: number()
        .default(4) //TODO: define constants
        .label('Number of participants in each group')
        .when(['groupStageEnable', 'groupStageType'], {
          is: (groupStageEnableVal: boolean, groupStageTypeVal: StageType) =>
            groupStageEnableVal === true &&
            isStageTypeRoundRobin(groupStageTypeVal),
          then: number().required().positive().max(20), //TODO: define constants
        })
        .when(['groupStageEnable', 'groupStageType'], {
          is: (groupStageEnableVal: boolean, groupStageTypeVal: StageType) =>
            groupStageEnableVal === true &&
            (isStageTypeSingle(groupStageTypeVal) ||
              isStageTypeDouble(groupStageTypeVal)),
          then: number().required().positive().max(256),
          //TODO: define constants
        }),
      groupStageGroupAdvancedSize: number()
        .default(2) //TODO: define constants
        .label('Number of participants advance from each group')
        .when(['groupStageEnable', 'groupStageType'], {
          is: (groupStageEnableVal: boolean, groupStageTypeVal: StageType) =>
            groupStageEnableVal === true &&
            isStageTypeRoundRobin(groupStageTypeVal),
          then: number()
            .required()
            .positive()
            .lessThan(ref('groupStageGroupSize')), //TODO: define constants
        })
        .when(['groupStageEnable', 'groupStageType'], {
          is: (groupStageEnableVal: boolean, groupStageTypeVal: StageType) =>
            groupStageEnableVal === true &&
            (isStageTypeSingle(groupStageTypeVal) ||
              isStageTypeDouble(groupStageTypeVal)),
          then: number()
            .required()
            .positive()
            .lessThan(ref('groupStageGroupSize'))
            .test(
              'numberOnlyPowerOf2Validation',
              '${label} must be a power of 2 (1,2,4,8,16,...)',
              numberOnlyPowerOf2Validation
            ),
          //TODO: define constants
        }),
      groupStageRoundRobinType: mixed<RoundRobinType | null>()
        .default(RoundRobinType.Once)
        .label('Participants play each other')
        .when(['groupStageEnable', 'groupStageType'], {
          is: (groupStageEnableVal: boolean, groupStageTypeVal: StageType) =>
            groupStageEnableVal === true &&
            isStageTypeRoundRobin(groupStageTypeVal),
          then: mixed<RoundRobinType>().required(),
          otherwise: mixed<RoundRobinType>().default(null),
        }),
      finalStageType: mixed<StageType>()
        .default(StageType.SingleElimination)
        .required()
        .label('Final Stage Type'),
      finalStageRoundRobinType: mixed<RoundRobinType>()
        .default(RoundRobinType.Once)
        .label('Participants play each other')
        .when('finalStageType', {
          is: (finalStageTypeVal: StageType) =>
            isStageTypeRoundRobin(finalStageTypeVal),
          then: mixed<RoundRobinType>().required(),
          otherwise: mixed<RoundRobinType>().default(null),
        }),
      finalStageSingleBronzeEnable: boolean()
        .default(null)
        .label('Include a match for 3rd place')
        .when('finalStageType', {
          is: (finalStageTypeVal: StageType) =>
            isStageTypeSingle(finalStageTypeVal),
          then: boolean().required(),
          otherwise: boolean().default(null),
        }),
    }),
  });
