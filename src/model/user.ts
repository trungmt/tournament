import { Schema, Model, Document, ObjectId, model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUserJson {
  _id: ObjectId;
  username: string;
  name: string;
}

interface IRefreshToken {
  refresh_token: string;
}

interface IUser extends IUserJson {
  password?: string;
  refresh_tokens?: IRefreshToken[];
  avatar?: Buffer;
  generateAccessToken(): string;
  generateRefreshToken(): Promise<string>;
}

interface IUserModel extends Model<IUser> {
  checkLogin(
    username: string,
    password: string
  ): Promise<IUser & Document<any, any, IUser>>;
}

const userSchema = new Schema<IUser, IUserModel, IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
    },
    refresh_tokens: [
      {
        refresh_token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password!, 8);
  }

  next();
});

userSchema.methods.toJSON = function (): IUserJson {
  // TODO: write a plugin to reduce values should be shown when call toJSON
  const userObject = this.toObject();

  return {
    _id: userObject._id,
    username: userObject.username,
    name: userObject.name,
  };
};

const generateToken = (
  payload: IUserJson,
  secret: string,
  expiresIn?: string
): string => {
  return expiresIn !== undefined
    ? jwt.sign(payload, secret, { expiresIn })
    : jwt.sign(payload, secret);
};

userSchema.methods.generateAccessToken = function (): string {
  const userJSON = this.toJSON();

  return generateToken(userJSON, process.env.ACCESS_TOKEN_SECRET!, '15s');
};

userSchema.methods.generateRefreshToken = async function (): Promise<string> {
  const userJSON = this.toJSON();
  const user = this;

  const refresh_token = generateToken(
    userJSON,
    process.env.REFRESH_TOKEN_SECRET!,
    '10d'
  );

  user.refresh_tokens = user.refresh_tokens?.concat({ refresh_token });
  await user.save();

  return refresh_token;
};

userSchema.methods.generateAccessToken = function (): string {
  const userJSON = this.toJSON();

  const access_token = generateToken(
    userJSON,
    process.env.ACCESS_TOKEN_SECRET!,
    '15s'
  );
  return access_token;
};

userSchema.statics.checkLogin = async (
  username: string,
  password: string
): Promise<IUser & Document<any, any, IUser>> => {
  const user = await UserModel.findOne({ username });
  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcryptjs.compare(password, user.password!);
  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user!;
};

const UserModel = model<IUser, IUserModel>('User', userSchema);

export default UserModel;
