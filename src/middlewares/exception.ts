import { Request, Response, NextFunction } from 'express';
import BaseError from '../exceptions/BaseError';

export const logException = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    process.env.NODE_ENV === 'development' ||
    (process.env.NODE_ENV === 'testing' &&
      process.env.ENABLE_LOGGING === 'true')
  ) {
    console.log('error', error);
  }
  next(error);
};

export const responseException = (
  error: BaseError, // TODO: it should be Error
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: check if error is BaseError, if not create new BaseError object
  let statusCode = 500;
  if (error.statusCode) {
    statusCode = error.statusCode;
  }
  res.status(statusCode).send(error);
};
