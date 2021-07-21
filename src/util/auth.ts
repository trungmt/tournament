import jwt from 'jsonwebtoken';
import { UserJson } from '../model/user';

interface AuthResponseJson {
  access_token: string;
  refresh_token: string;
  user: UserJson;
}

export const generateToken = (
  payload: UserJson,
  secret: string,
  expiresIn?: string
): string => {
  return expiresIn !== undefined
    ? jwt.sign(payload, secret, { expiresIn })
    : jwt.sign(payload, secret);
};

export const generateAuthResponseJson = (user: UserJson): AuthResponseJson => {
  // TODO: handle empty ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET
  return {
    access_token: generateToken(user, process.env.ACCESS_TOKEN_SECRET!),
    refresh_token: generateToken(user, process.env.REFRESH_TOKEN_SECRET!),
    user: user,
  };
};
