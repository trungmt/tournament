import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import AdminEntityControllerInterface, {
  DetailFormParams,
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
    DetailFormParams,
    any,
    any,
    ParsedQs,
    Record<string, any>
  >;
  abstract delete: RequestHandler<
    DetailFormParams,
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
  abstract detail: RequestHandler<
    DetailFormParams,
    any,
    any,
    ParsedQs,
    Record<string, any>
  >;
}
