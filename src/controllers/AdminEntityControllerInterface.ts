import { ParamsDictionary } from 'express-serve-static-core';
import { RequestHandler } from 'express';
import { ParsedQs } from 'qs';

export interface DetailFormParams extends ParamsDictionary {
  id: string;
}
export interface ListQueryParams extends ParsedQs {
  page: string;
  limit: string;
}

export default interface AdminEntityControllerInterface {
  entityName: string;
  create: RequestHandler;
  update: RequestHandler<DetailFormParams>;
  delete: RequestHandler<DetailFormParams>;
  list: RequestHandler<ParamsDictionary, any, any, ListQueryParams>;
  detail: RequestHandler<DetailFormParams>;
}
