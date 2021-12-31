import { format } from 'util';
import { ObjectID } from 'mongodb';
import { Schema, model, Model } from 'mongoose';
import {
  validatePermalinkPattern,
  validateStageType,
  isStageTypeRoundRobin,
  getStageTypeValidationMessage,
  isStageTypeSingle,
} from '../services/ValidationService';
import validationLocaleEn from '../configs/locale/validation.en';

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
    default: (doc: ITournamentDoc) => doc.name,
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
        message: format(
          validationLocaleEn.validationMessage.permalinkPattern,
          validationLocaleEn.tournament.label.permalink
        ),
      },
    ],
  },
  groupStageEnable: {
    type: Boolean,
    required: true,
  },
  groupStageType: {
    type: Number,
    default: null,
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
    default: null,
    required: function (this: ITournamentDoc) {
      return this.groupStageEnable;
    },
  },
  groupStageGroupAdvancedSize: {
    type: Number,
    default: null,
    required: function (this: ITournamentDoc) {
      return this.groupStageEnable;
    },
  },
  groupStageRoundRobinType: {
    type: Number,
    default: null,
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
    default: null,
    required: function (this: ITournamentDoc) {
      return isStageTypeRoundRobin(this.finalStageType);
    },
  },
  finalStageSingleBronzeEnable: {
    type: Boolean,
    default: null,
    required: function (this: ITournamentDoc) {
      return isStageTypeSingle(this.finalStageType);
    },
  },
});

// -- schema document methods --
tournamentSchema.methods.toJSON = function (): ITournament & { _id: ObjectID } {
  // TODO: write a plugin to reduce values should be shown when call toJSON
  const tournamentObject = this.toObject();
  const {
    _id,
    name,
    nameDisplay,
    permalink,
    groupStageEnable,
    groupStageType,
    groupStageGroupSize,
    groupStageGroupAdvancedSize,
    groupStageRoundRobinType,
    finalStageType,
    finalStageSingleBronzeEnable,
    finalStageRoundRobinType,
  } = tournamentObject;

  return {
    _id,
    name: nameDisplay ? nameDisplay : name,
    permalink,
    groupStageEnable,
    groupStageType,
    groupStageGroupSize,
    groupStageGroupAdvancedSize,
    groupStageRoundRobinType,
    finalStageType,
    finalStageSingleBronzeEnable,
    finalStageRoundRobinType,
  };
};

const prepareName = (document: ITournamentDoc) => {
  document.nameDisplay = document.name;
  document.name = document.name.toLowerCase();
};
tournamentSchema.pre('save', function (this, next) {
  prepareName(this);
  next();
});
tournamentSchema.pre('findOneAndUpdate', async function (next) {
  let update = this.getUpdate();
  prepareName(update as ITournamentDoc); // TODO: careful, not works all case
  next();
});

const TournamentModel = model<ITournamentDoc, ITournamentModel>(
  'Tournament',
  tournamentSchema
);

export default TournamentModel;
