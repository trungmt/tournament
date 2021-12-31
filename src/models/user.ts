import { Schema, Model, Document, Types, model } from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import configs from '../configs';
// TODO: set up function to generate responseJSON which is object with
// user, accessToken, refreshToken

// interface for response in json
export interface IUserJson {
  username: string;
  name: string;
}

interface IRefreshToken {
  refreshToken: string;
}

// TODO: move to services/auth/
export interface AuthResponse {
  user: IUserDoc & Document<any, any, IUserDoc>;
  accessToken: string;
}
export interface IUser extends IUserJson {
  password: string;
  refreshTokens?: IRefreshToken[];
  avatar?: Buffer;
}

interface IUserDoc extends IUser {
  // instance methods
  generateAccessToken(): string;
  generateRefreshToken(): Promise<string>;
}

interface IUserModel extends Model<IUserDoc> {
  checkLogin(
    username: string,
    password: string
  ): Promise<IUserDoc & Document<any, any, IUserDoc>>;

  checkRefreshToken(
    refreshToken: string
  ): Promise<IUserDoc & Document<any, any, IUserDoc>>;
}

const generateToken = (
  payload: IUserJson,
  secret: string,
  expiresIn?: string
): string => {
  return typeof expiresIn !== 'undefined'
    ? jwt.sign(payload, secret, { expiresIn })
    : jwt.sign(payload, secret);
};

const userSchema = new Schema<IUserDoc, IUserModel, IUserDoc>(
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
    refreshTokens: [
      {
        refreshToken: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Schema.Types.Buffer,
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

// -- schema static methods --
userSchema.statics.checkLogin = async (
  username: string,
  password: string
): Promise<IUserDoc & Document<any, any, IUserDoc>> => {
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

userSchema.statics.checkRefreshToken = async (
  refreshToken: string
): Promise<IUserDoc & Document<any, any, IUserDoc>> => {
  const userJSON = jwt.verify(
    refreshToken,
    configs.refreshTokenSecret
  ) as IUserJson;
  if (!userJSON.username) {
    throw new Error('Unable to refresh accessToken');
  }

  const user = await UserModel.findOne({
    username: userJSON.username,
    'refreshTokens.refreshToken': refreshToken,
  });

  if (!user) {
    throw new Error('Unable to refresh accessToken');
  }

  return user;
};

// -- END schema static methods --

// -- schema document methods --
userSchema.methods.toJSON = function (): IUserJson {
  // TODO: write a plugin to reduce values should be shown when call toJSON
  const userObject = this.toObject();

  return {
    username: userObject.username,
    name: userObject.name,
  };
};

userSchema.methods.generateRefreshToken = async function (): Promise<string> {
  const userJSON = this.toJSON();
  const user = this;

  const refreshToken = generateToken(
    userJSON,
    configs.refreshTokenSecret,
    configs.refreshTokenExpiry
  );

  user.refreshTokens = user.refreshTokens?.concat({ refreshToken });
  await user.save();

  return refreshToken;
};

userSchema.methods.generateAccessToken = function (): string {
  const userJSON = this.toJSON();

  const accessToken = generateToken(
    userJSON,
    configs.accessTokenSecret,
    configs.accessTokenExpiry!
  );
  return accessToken;
};

// -- END schema document methods --

const UserModel = model<IUserDoc, IUserModel>('User', userSchema);

export default UserModel;
