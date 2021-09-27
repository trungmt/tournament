import { CustomResponse } from '../services/CustomResponse';

class BaseError extends Error {
  name: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
  data?: {
    [dataName: string]: any;
  };

  constructor(
    message: string,
    name: string,
    statusCode: number,
    isOperational: boolean,
    data?: {
      [dataName: string]: any;
    }
  ) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.message = message;
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.data = data;

    // TODO: merge stack trace
    Error.captureStackTrace(this);
  }

  toJSON() {
    return new CustomResponse(
      this.message,
      this.data,
      this.name,
      this.stack
    ).toJSON();
  }
}

export default BaseError;
