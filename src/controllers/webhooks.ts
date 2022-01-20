import { Request, Response, Next } from 'restify';
import { InternalServerError } from 'restify-errors';
import { WebHookPost } from '../definitions/post-webhook-data';
import { sendHttpError } from '../errors';
import { PurchasesStore } from '../stores/purchases';


export const postWebhooks = (purchasesStore: PurchasesStore) => (req: Request, res: Response, next: Next) => {

  const body = (req.body as WebHookPost);

  purchasesStore.addCollection(body.applicationUsername, body.purchases, (err, result) => {
    if (err) {
      return sendHttpError(next, new InternalServerError('failed to save the collection in redis'));
    }

    res.send(200);
    next();
  });
};

