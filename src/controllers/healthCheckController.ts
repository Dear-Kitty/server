import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const sendStatus = async (req: Request, res: Response) => {
  res.status(StatusCodes.OK);
};
