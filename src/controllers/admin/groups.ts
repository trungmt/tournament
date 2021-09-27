import { Request, Response } from 'express';
export const index = (req: Request, res: Response) => {
  res.send(`Hello, here is admin groups`);
};

export const create = (req: Request, res: Response) => {
  res.send(`Hello, this is new groups`);
};
