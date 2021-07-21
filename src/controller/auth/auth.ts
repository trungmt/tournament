import { Request, Response } from 'express';
import User from '../../model/user';
import { generateAuthResponseJson } from '../../util/auth';

export const login = (req: Request, res: Response) => {};

export const register = async (req: Request, res: Response) => {
  const userFormData = req.body;
  const user = new User(userFormData);
  try {
    await user.save();
    const responseJson = generateAuthResponseJson(user.toJSON());
    res.status(201).send(responseJson);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const logout = (req: Request, res: Response) => {};

export const refresh = (req: Request, res: Response) => {};
