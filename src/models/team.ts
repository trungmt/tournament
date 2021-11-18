import { Schema, model, Model } from 'mongoose';

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

const TeamModel = model<ITeamDoc, ITeamModel>('Team', teamSchema);

export default TeamModel;
