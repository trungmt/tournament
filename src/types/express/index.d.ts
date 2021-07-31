/// <reference types="express" />
import { Document, Query } from 'mongoose';
import { IUser } from '../model/user';

/** This type definition auguments for auth middleware
 * which stays at src/middleware/auth.ts
 *
 * More detail, it called Declaration Merging
 * @link https://www.typescriptlang.org/docs/handbook/declaration-merging.html
 * which will extends Express's default Request interface
 * Typescript config stays here tsconfig.json
 * */

/**
 * when using import above if I use Express instead of 'express' i will get
 * errors in middleware/auth.ts
 * */
declare module 'express' {
  interface Request {
    token?: string;
    user?: IUser & Document<any, any, IUser>;
  }
}
