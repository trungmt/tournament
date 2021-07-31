import { Schema, model, Model, SchemaTypes } from 'mongoose';

interface ITeam {
  name: string;
  permalink: string;
  flagIcon?: Schema.Types.Buffer;
}
interface ITeamModel extends Model<ITeam> {}

const teamSchema = new Schema<ITeam, ITeamModel, ITeam>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    permalink: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (permalink: string) => {
          return /^([a-zA-Z0-9]+-)*[a-zA-Z0-9]+$/.test(permalink);
        },
        message: 'Permalink only accepts alphanumeric and dash',
      },
    },
    flagIcon: {
      type: Schema.Types.Buffer,
    },
  },
  {
    timestamps: true,
  }
);

const TeamModel = model<ITeam>('Team', teamSchema);

export default TeamModel;
