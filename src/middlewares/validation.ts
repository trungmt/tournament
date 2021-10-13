import { RequestHandler, Request, Response, NextFunction } from 'express';
import { ValidationError } from '../exceptions/ValidationError';
import { AnyObjectSchema, ValidationError as yupValidationError } from 'yup';
import { extname } from 'path';
import BaseError from '../exceptions/BaseError';

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
      await schema.validate(req, {
        ...options,
        context: { next, _id },
      });
      next();
      return;
    } catch (error) {
      if (error instanceof yupValidationError) {
        // console.log('Error validationAsync', error.inner);
        error.inner.forEach(err => {
          if (typeof err.path === 'undefined') {
            return true;
          }
          const fieldName = getFieldNameFromPath(err.path);
          if (fieldName && req.errors && !req.errors[fieldName]) {
            req.errors[fieldName] = err.message;
          }
        });
        const validationError = new ValidationError(
          'There are input validation errors. Please check each input again base on our instruction.',
          req.errors
        );
        next(validationError);
        return;
      }
      // console.log('Error validationAsync', error);
      throw new BaseError(
        'Error when running validation',
        'Error when running validation',
        500,
        false
      );
    }
  };

/**
 * Get form field name from yup validation error's path
 *
 * @param path string yup validation error path for each field
 * @returns string in case path has form body.{form-field}, return form-field
 *                 in case path has form {form-field}, return form-field
 */
const getFieldNameFromPath = (path: string | undefined): string | undefined => {
  if (typeof path === 'undefined' || path === '') return undefined;
  const fieldNameArr = extname(path).split('.');
  return fieldNameArr.length === 1 ? path : fieldNameArr.pop()!;
};
