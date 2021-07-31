import { Request, response, Response } from 'express';
import User from '../../model/user';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

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
  const user = new User(userFormData);
  try {
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
    res.status(400).send();
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
    console.log('error', error);
    if (
      error instanceof TokenExpiredError ||
      error.message == 'Unable to refresh accessToken'
    ) {
      return res.status(403).send();
    }
    if (error instanceof JsonWebTokenError) {
      return res.status(401).send();
    }
  }
};
