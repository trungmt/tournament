import { format } from 'util';
import { Schema, model, Model } from 'mongoose';
import { ObjectID } from 'mongodb';
import { validatePermalinkPattern } from '../services/ValidationService';
import validationLocaleEn from '../configs/locale/validation.en';

export interface ITeamModel extends Model<ITeamDoc> {}

const teamSchema = new Schema<ITeamDoc, ITeamModel, ITeamDoc>(
  {
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
    shortName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    shortNameDisplay: {
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
          message: format(
            validationLocaleEn.validationMessage.permalinkPattern,
            validationLocaleEn.tournament.label.permalink
          ),
        },
      ],
    },
    flagIcon: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    strictQuery: 'throw',
  }
);

// -- schema document methods --
teamSchema.methods.toJSON = function (): ITeam & { _id: ObjectID } {
  // TODO: write a plugin to reduce values should be shown when call toJSON
  const teamObject = this.toObject();

  return {
    _id: teamObject._id,
    name: teamObject.nameDisplay,
    shortName: teamObject.shortNameDisplay,
    permalink: teamObject.permalink,
    flagIcon: teamObject.flagIcon,
  };
};

const TeamModel = model<ITeamDoc, ITeamModel>('Team', teamSchema);

export default TeamModel;
