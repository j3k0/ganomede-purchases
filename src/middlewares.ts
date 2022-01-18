
import lodash from 'lodash';
import { Request, Response, Next as NextFunction } from 'restify';

import { InternalServerError } from 'restify-errors';
import { InvalidAuthTokenError, InvalidCredentialsError, sendHttpError } from './errors';
import { logger } from './logger';

export interface RequestWithGanomede extends Request {
  ganomede: { secretMatches: boolean; userId?: string; }
}

export const requireSecret = (req: Request, res: Response, next: NextFunction) => {
  return (req as RequestWithGanomede).ganomede.secretMatches
    ? next()
    : sendHttpError(next, new InvalidCredentialsError());
};

const parseUserIdFromSecretToken = (secret: string, token: string) => {
  return secret && token && token.startsWith(secret) && (token.length > secret.length + 1)
    ? token.slice(secret.length + 1)
    : false;
};

export const requireAuth = ({ authdbClient = null, secret = '', paramName = 'token' }:
  { authdbClient: any, secret: string, paramName?: string } = { authdbClient: null, secret: '', paramName: 'token' }) => (req: RequestWithGanomede, res: Response, next: NextFunction) => {
    const token = lodash.get(req, `params.${paramName}`);
    if (!token)
      return sendHttpError(next, new InvalidAuthTokenError());

    const spoofed = secret && parseUserIdFromSecretToken(secret, token);
    if (spoofed) {
      req.ganomede.secretMatches = true;
      req.ganomede.userId = spoofed;
      return next();
    }

    authdbClient?.getAccount(token, (err: Error, redisResult: any) => {
      if (err) {
        logger.error('authdbClient.getAccount("%j") failed', token, err);
        return sendHttpError(next, new InternalServerError());
      }

      if (!redisResult)
        return sendHttpError(next, new InvalidCredentialsError());

      // Authdb already JSON.parsed redisResult for us,
      // but sometimes it is a string with user id,
      // and sometimes it is account object with {username, email, etc...}
      const userId = (typeof redisResult === 'string')
        ? redisResult
        : redisResult.username; // userId used to be username from profile

      if (!redisResult)
        return sendHttpError(next, new InvalidCredentialsError());

      req.ganomede.userId = userId;
      return next();
    });
  };
