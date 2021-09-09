import Joi from 'joi';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { options } from '../validations/teamValidation';
import { ValidationError } from '../exceptions/ValidationError';

export const validation =
  (schema: Joi.ObjectSchema): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.errors) req.errors = {};

    const { error, value } = schema.validate(req, options);
    if (!error) {
      console.log('Validation value', value);
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
