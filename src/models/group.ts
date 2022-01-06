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
import { defaultEntityValues } from '../configs/constants';

export interface IGroupModel extends Model<IGroupDoc> {}
export interface IGroupParticipantModel extends Model<IGroupParticipant> {}

const groupParticipantSchema = new Schema<
  IGroupParticipant,
  IGroupParticipantModel,
  IGroupParticipant
>({
  teamId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  seed: {
    type: Number,
    required: true,
  },
  win: {
    type: Number,
    required: true,
    default: 0,
  },
  lose: {
    type: Number,
    required: true,
    default: 0,
  },
  draw: {
    type: Number,
    required: true,
    default: 0,
  },
  point: {
    type: Number,
    required: true,
    default: 0,
  },
  tiedPoint: {
    type: Number,
    required: true,
    default: 0,
  },
  scoreFor: {
    type: Number,
    required: true,
    default: 0,
  },
  scoreAgainst: {
    type: Number,
    required: true,
    default: 0,
  },
  scoreDifference: {
    type: Number,
    required: true,
    default: 0,
  },
});

const groupSchema = new Schema<IGroupDoc, IGroupModel, IGroupDoc>({
  tournamentId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameValidate: {
    type: String,
    default: (doc: IGroupDoc) => doc.name,
    lowercase: true,
    unique: true,
  },
  isGroupStage: {
    type: Boolean,
    required: true,
  },
  participants: [groupParticipantSchema],
});

// -- schema document methods --
groupSchema.methods.toJSON = function (): IGroup & { _id: ObjectID } {
  // TODO: write a plugin to reduce values should be shown when call toJSON
  const groupObject = this.toObject();
  const { _id, nameValidate, ...others } = groupObject;

  return {
    _id,
    ...others,
  };
};

const GroupModel = model<IGroupDoc, IGroupModel>('Group', groupSchema);

export default GroupModel;
