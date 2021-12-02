import { Schema, model, Model } from 'mongoose';
import { ObjectID } from 'mongodb';

export interface ITeamModel extends Model<ITeamDoc> {}

const validatePermalinkPattern = function (permalink: string) {
  return /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/.test(permalink);
};

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
          message: 'Permalink only accepts alphanumeric and dash',
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
  const userObject = this.toObject();

  return {
    _id: userObject._id,
    name: userObject.nameDisplay,
    shortName: userObject.shortNameDisplay,
    permalink: userObject.permalink,
    flagIcon: userObject.flagIcon,
  };
};

const TeamModel = model<ITeamDoc, ITeamModel>('Team', teamSchema);

export default TeamModel;
