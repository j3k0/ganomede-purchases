import { WebHookPost } from 'iaptic';
import { Request, Response, Next } from 'restify';
import { InternalServerError } from 'restify-errors';
import { config } from '../../config';
import { InvalidCredentialsError, sendHttpError } from '../errors';
import { PurchasesStore } from '../stores/purchases';


export const postWebhooks = (purchasesStore: PurchasesStore) => (req: Request, res: Response, next: Next) => {

  const body = (req.body as WebHookPost);

  if (body.password !== config.foveaApiSecret) {
    return sendHttpError(next, new InvalidCredentialsError());
  }


  purchasesStore.addCollection(body.applicationUsername, body.purchases, (err, result) => {
    if (err) {
      return sendHttpError(next, new InternalServerError('failed to save the collection in redis'));
    }

    res.send(200);
    next();
  });
};

