import { ParamsDictionary } from 'express-serve-static-core';
import { RequestHandler } from 'express';

export interface ModifyFormParams extends ParamsDictionary {
  id: string;
}

export default interface AdminEntityControllerInterface {
  entityName: string;
  create: RequestHandler;
  update: RequestHandler<ModifyFormParams>;
  delete: RequestHandler<ModifyFormParams>;
  list: RequestHandler;
  form: RequestHandler<ModifyFormParams>;
}
