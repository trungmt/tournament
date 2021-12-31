import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUserJson } from '../models/user';
import configs from '../configs';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.get('Authorization')?.replace('Bearer ', '');
    if (!accessToken) {
      throw new Error();
    }
    const userJSON = jwt.verify(
      accessToken!,
      configs.accessTokenSecret
    ) as IUserJson;
    const user = await User.findOne({
      username: userJSON.username,
    });

    if (!user) {
      throw new Error();
    }
    req.token = accessToken;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send(error);
  }
};

export default auth;
