interface JSONResponse {
  message?: string;
  data?: {
    [dataName: string]: any;
  };
  name?: string;
  stack?: string;
}

export class CustomResponse {
  message?: string;
  data?: {
    [dataName: string]: any;
  };
  name?: string;
  stack?: string;

  constructor(message?: string, data?: any, name?: string, stack?: string) {
    this.message = message;
    this.data = data;
    this.name = name;
    this.stack = stack;
  }

  toJSON(): JSONResponse {
    let jsonObject: JSONResponse = {
      message: this.message,
    };

    if (this.data !== undefined) {
      jsonObject.data = this.data;
    }
    if (this.name !== undefined) {
      jsonObject.name = this.name;
    }

    if (process.env.NODE_ENV === 'development' && this.stack !== undefined) {
      jsonObject.stack = this.stack;
    }

    return jsonObject;
  }
}