import { Request, response, Response } from 'express';
import User from '../../model/user';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.checkLogin(username, password);
    const access_token = user.generateAccessToken();
    const refresh_token = await user.generateRefreshToken();

    const responseJson = {
      user,
      access_token,
      refresh_token,
    };
    res.status(200).send(responseJson);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const register = async (req: Request, res: Response) => {
  const userFormData = req.body;
  const user = new User(userFormData);
  try {
    await user.save();
    const access_token = user.generateAccessToken();
    const refresh_token = await user.generateRefreshToken();

    const responseJson = {
      user,
      access_token,
      refresh_token,
    };
    res.status(201).send(responseJson);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const logout = (req: Request, res: Response) => {};

export const refresh = (req: Request, res: Response) => {
  const { access_token, refresh_token } = req.body;
};
