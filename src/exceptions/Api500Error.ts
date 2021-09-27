import BaseError from './BaseError';

class Api500Error extends BaseError {
  constructor(
    message: string = 'Internal Server Error',
    name: string = 'Internal Server Error',
    statusCode: number = 500,
    isOperational = true
  ) {
    super(message, name, statusCode, isOperational);
  }
}

export default Api500Error;
