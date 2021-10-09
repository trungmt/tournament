// import Joi, { ValidationOptions } from 'joi';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { ValidationError } from '../exceptions/ValidationError';
import yup, {
  AnyObjectSchema,
  ValidationError as yupValidationError,
} from 'yup';

const options = {
  abortEarly: false,
  allowUnknown: true,
};

export const validationAsync =
  (schema: AnyObjectSchema): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.errors) req.errors = {};
    const _id = req.params.id;

    try {
      await schema.validate(req.body, {
        ...options,
        context: { next, _id },
      });
      next();
      return;
    } catch (error) {
      console.log('Error validationAsync', error);
      if (error instanceof yupValidationError) {
        error.inner.forEach(err => {
          const fieldName = err.path?.toString();
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
