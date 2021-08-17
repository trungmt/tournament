import { Schema, model, Model, Types } from 'mongoose';

export interface ITeam {
  _id: Types._ObjectId;
  name: string;
  permalink: string;
  flagIcon: Buffer;
}
export interface ITeamDoc extends ITeam {
  nameDisplay: string;
}
interface ITeamModel extends Model<ITeamDoc> {}

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
      type: Schema.Types.Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.pre('validate', function (next) {
  const team = this;

  team.nameDisplay = '';
  if (team.name) {
    team.nameDisplay = team.name;
    team.name = team.name.toLowerCase();
  }
  next();
});

const TeamModel = model<ITeamDoc, ITeamModel>('Team', teamSchema);

export default TeamModel;
