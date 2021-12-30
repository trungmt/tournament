import { Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import User from '../../models/user';
import configs from '../../configs';
import constants from '../../configs/constants';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.checkLogin(username, password);
    const accessToken = user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const responseJson = {
      user,
      accessToken,
    };
    generateRefreshCookie(refreshToken, res);
    res.status(200).send(responseJson);
  } catch (error) {
    res.status(400).send();
  }
};

export const register = async (req: Request, res: Response) => {
  const userFormData = req.body;
  const avatar = req.file;
  const user = new User(userFormData);

  //TODO: function to prepare env const
  const avatarWidth = constants.DEFAULT_IMAGE_WIDTH;
  const avatarHeight = constants.DEFAULT_IMAGE_HEIGHT;

  try {
    if (avatar) {
      // user.avatar = await resizeImage(avatar.buffer, avatarWidth, avatarHeight);
    }
    await user.save();
    const accessToken = user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const responseJson = {
      user,
      accessToken,
    };
    generateRefreshCookie(refreshToken, res);
    res.status(201).send(responseJson);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const logout = (req: Request, res: Response) => {
  const { refreshToken } = req.body;
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  try {
    const user = await User.checkRefreshToken(refreshToken);

    const accessToken = user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();

    const responseJson = {
      user,
      accessToken,
    };
    generateRefreshCookie(newRefreshToken, res);
    res.status(201).send(responseJson);
  } catch (error) {
    if (
      error instanceof Error &&
      (error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError ||
        error.message == 'Unable to refresh accessToken')
    ) {
      console.log('refresh error', error);
      return res.status(401).send(error);
    }
    // return res.status(403).send();
    // if (error instanceof JsonWebTokenError) {
    // }
  }
};

const generateRefreshCookie = (refreshToken: string, response: Response) => {
  return response.cookie('refreshToken', refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * configs.refreshTokenExpirtyNumber,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};
