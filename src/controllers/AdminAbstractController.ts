import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import AdminEntityControllerInterface, {
  ModifyFormParams,
  ListQueryParams,
} from './AdminEntityControllerInterface';

export default abstract class AdminAbstractController
  implements AdminEntityControllerInterface
{
  entityName: string;
  constructor(_entityName: string) {
    this.entityName = _entityName;
  }

  abstract create: RequestHandler<
    ParamsDictionary,
    any,
    any,
    ParsedQs,
    Record<string, any>
  >;

  abstract update: RequestHandler<
    ModifyFormParams,
    any,
    any,
    ParsedQs,
    Record<string, any>
  >;
  abstract delete: RequestHandler<
    ModifyFormParams,
    any,
    any,
    ParsedQs,
    Record<string, any>
  >;
  abstract list: RequestHandler<
    ParamsDictionary,
    any,
    any,
    ListQueryParams,
    Record<string, any>
  >;
  abstract form: RequestHandler<
    ModifyFormParams,
    any,
    any,
    ParsedQs,
    Record<string, any>
  >;
}
