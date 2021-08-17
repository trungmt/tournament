import { Request, response, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import User from '../../model/user';
import { resizeImage } from '../../middleware/upload';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.checkLogin(username, password);
    const accessToken = user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const responseJson = {
      user,
      accessToken,
      refreshToken,
    };
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
  const avatarWidth = parseInt(process.env.DEFAULT_IMAGE_WIDTH!);
  const avatarHeight = parseInt(process.env.DEFAULT_IMAGE_HEIGHT!);

  try {
    if (avatar) {
      user.avatar = await resizeImage(avatar.buffer, avatarWidth, avatarHeight);
    }
    await user.save();
    const accessToken = user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    const responseJson = {
      user,
      accessToken,
      refreshToken,
    };
    res.status(201).send(responseJson);
  } catch (error) {
    res.status(400).send(error);
  }
};

export const logout = (req: Request, res: Response) => {
  const { refreshToken } = req.body;
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  try {
    const accessToken = await User.checkRefreshToken(refreshToken);
    res.status(200).send({ accessToken });
  } catch (error) {
    if (
      error instanceof TokenExpiredError ||
      error.message == 'Unable to refresh accessToken'
    ) {
      return res.status(403).send();
    }
    if (error instanceof JsonWebTokenError) {
      return res.status(401).send(error);
    }
  }
};
