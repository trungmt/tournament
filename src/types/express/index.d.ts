/// <reference types="express" />
import { Document, Query } from 'mongoose';
import { IUser } from '../models/user';
import { response } from 'express';

/** This type definition auguments for auth middleware
 * which stays at src/middlewares/auth.ts
 *
 * More detail, it called Declaration Merging
 * @link https://www.typescriptlang.org/docs/handbook/declaration-merging.html
 * which will extends Express's default Request interface
 * Typescript config stays here tsconfig.json
 * */

/**
 * when using import above if I use Express instead of 'express' i will get
 * errors in middlewares/auth.ts
 * */

declare module 'express' {
  interface Request {
    token?: string;
    user?: IUser & Document<any, any, IUser>;
    errors?: {
      [k: string]: string;
    };
  }

  interface Response {
    sendData?(
      statusCode: number,
      message?: string,
      data?: {
        [dataName: string]: any;
      },
      name?: string,
      stack?: string
    ): this;
  }
  interface RequestHandler<
    P = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query,
    Locals extends Record<string, any> = Record<string, any>
  > extends core.RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
    (
      req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
      res: Response<ResBody, Locals>,
      next: NextFunction
    ): void;
  }
}
