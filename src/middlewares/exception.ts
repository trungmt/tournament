import { Request, Response, NextFunction } from 'express';
import BaseError from '../exceptions/BaseError';

export const logException = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(`Error at route ${req.route}:`);
  // console.log(error);
  next(error);
};

export const responseException = (
  error: BaseError, // TODO: it should be Error
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: check if error is BaseError, if not create new BaseError object
  res.status(error.statusCode).send(error);
};
