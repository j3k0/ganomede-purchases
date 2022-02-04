
import lodash from 'lodash';
import { Request, Response, Next as NextFunction, Next } from 'restify';
import { HttpError } from 'restify-errors';
import { InternalServerError } from 'restify-errors';
import { InvalidAuthTokenError, InvalidCredentialsError, sendHttpError } from '../errors';
import { logger } from '../logger';


export interface AuthdbUser {
  username: string;
  email?: string;
}
export interface AuthdbClient {
  addAccount: (token: string, user: AuthdbUser | null, callback?: (err?: HttpError | null) => void) => void;
  getAccount: (token: string, callback: (err: HttpError | null, user?: AuthdbUser) => void) => void;
}

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
  { authdbClient: AuthdbClient | null, secret: string, paramName?: string } = { authdbClient: null, secret: '', paramName: 'token' }) => (req: Request, res: Response, next: NextFunction) => {
    const token = lodash.get(req, `params.${paramName}`);
    if (!token)
      return sendHttpError(next, new InvalidAuthTokenError());

    const spoofed = secret && parseUserIdFromSecretToken(secret, token);
    if (spoofed) {
      (req as RequestWithGanomede).ganomede.secretMatches = true;
      (req as RequestWithGanomede).ganomede.userId = spoofed;
      return next();
    }

    if (!authdbClient) {
      logger.error('authdbClient is not configured', token);
      return sendHttpError(next, new InternalServerError());
    }

    authdbClient?.getAccount(token, (err: Error | null, redisResult?: AuthdbUser) => {
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

      (req as RequestWithGanomede).ganomede.userId = userId;
      req.params.userId = userId;
      return next();
    });
  };
