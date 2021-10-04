import Joi, { ValidationOptions } from 'joi';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { ValidationError } from '../exceptions/ValidationError';

const options: ValidationOptions = {
  abortEarly: false,
  allowUnknown: true,
};

export const validation =
  (schema: Joi.ObjectSchema): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.errors) req.errors = {};

    const { error, value } = schema.validate(req.body, options);
    if (!error) {
      next();
      return;
    }

    error!.details.forEach(err => {
      const fieldName = err.path.pop()?.toString();
      if (fieldName && req.errors && !req.errors[fieldName]) {
        req.errors[fieldName] = err.message;
      }
    });

    const validationError = new ValidationError(
      'There are input validation errors. Please check each input again base on our instruction.',
      req.errors
    );
    next(validationError);
  };

export const validationAsync =
  (schema: Joi.ObjectSchema): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    if (!req.errors) req.errors = {};

    try {
      const value = await schema.validateAsync(req.body, options);
      next();
      return;
    } catch (error) {
      console.log('ERROR', error);
      if (error instanceof Joi.ValidationError) {
        error.details.forEach(err => {
          const fieldName = err.path.pop()?.toString();
          if (fieldName && req.errors && !req.errors[fieldName]) {
            req.errors[fieldName] = err.message;
          }
        });
      }
      const validationError = new ValidationError(
        'There are input validation errors. Please check each input again base on our instruction.',
        req.errors
      );
      next(validationError);
    }
  };
