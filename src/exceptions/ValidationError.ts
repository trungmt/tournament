import BaseError from './BaseError';

export class ValidationError extends BaseError {
  constructor(
    message: string,
    data: {
      [dataName: string]: any;
    },
    name: string = 'ValidationError',
    statusCode: number = 422,
    isOperational: boolean = true
  ) {
    super(message, name, statusCode, isOperational, data);
  }
}
