import { ObjectID } from 'mongodb';
import { Schema, model, Model } from 'mongoose';
import {
  validatePermalinkPattern,
  validateStageType,
  isStageTypeRoundRobin,
  getStageTypeValidationMessage,
  isStageTypeSingle,
} from '../services/ValidationService';

export interface ITournamentModel extends Model<ITournamentDoc> {}

const tournamentSchema = new Schema<
  ITournamentDoc,
  ITournamentModel,
  ITournamentDoc
>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  nameDisplay: {
    type: String,
    required: true,
  },
  permalink: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    validate: [
      {
        validator: validatePermalinkPattern,
        message: 'Permalink only accepts alphanumeric connected by dash',
      },
    ],
  },
  groupStageEnable: {
    type: Boolean,
    required: true,
  },
  groupStageType: {
    type: Number,
    required: function (this: ITournamentDoc) {
      return this.groupStageEnable;
    },
    validate: {
      validator: validateStageType,
      message: getStageTypeValidationMessage('Group Stage'),
    },
  },
  groupStageGroupSize: {
    type: Number,
    required: function (this: ITournamentDoc) {
      return this.groupStageEnable;
    },
  },
  groupStageGroupAdvancedSize: {
    type: Number,
    required: function (this: ITournamentDoc) {
      return this.groupStageEnable;
    },
  },
  groupStageRoundRobinType: {
    type: Number,
    required: function (this: ITournamentDoc) {
      return (
        this.groupStageEnable && isStageTypeRoundRobin(this.groupStageType)
      );
    },
  },
  finalStageType: {
    type: Number,
    required: true,
    validate: {
      validator: validateStageType,
      message: getStageTypeValidationMessage('Final Stage'),
    },
  },
  finalStageRoundRobinType: {
    type: Number,
    required: function (this: ITournamentDoc) {
      return isStageTypeRoundRobin(this.finalStageType);
    },
  },
  finalStageSingleBronzeEnable: {
    type: Boolean,
    required: function (this: ITournamentDoc) {
      return isStageTypeSingle(this.finalStageType);
    },
  },
});

// tournamentSchema.path('groupStageGroupSize').required(function() { return this.})
const TeamModel = model<ITournamentDoc, ITournamentModel>(
  'Team',
  tournamentSchema
);

export default TeamModel;
