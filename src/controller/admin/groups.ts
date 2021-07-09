import { Request, Response } from 'express';
export const index = (req: Request, res: Response) => {
  res.send(`Hello, here is admin groups`);
};
