import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUserJson } from '../model/user';

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.get('Authorization')?.replace('Bearer ', '');
    if (!accessToken) {
      throw new Error();
    }
    const userJSON = jwt.verify(
      accessToken!,
      process.env.ACCESS_TOKEN_SECRET!
    ) as IUserJson;
    const user = await User.findOne({
      _id: userJSON._id,
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
