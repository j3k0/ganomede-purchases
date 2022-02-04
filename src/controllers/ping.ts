
import { Request, Response, Next as NextFunction } from 'restify';

export const get = (req: Request, res: Response, next: NextFunction) => {
  res.send(`pong/${req.params.token}`);
  next();
};

export const head = (req: Request, res: Response, next: NextFunction) => {
  res.end();
  next();
};
