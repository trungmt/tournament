import BaseError from './BaseError';

class Api404Error extends BaseError {
  constructor(
    message: string = 'Not Found',
    name: string = 'Not Found',
    statusCode: number = 404,
    isOperational: boolean = true
  ) {
    super(message, name, statusCode, isOperational);
  }
}

export default Api404Error;
