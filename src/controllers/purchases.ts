import { Request, Response, Next } from 'restify';
import { InternalServerError } from 'restify-errors';
import { ApiTransaction, PurchasesCollection } from '../definitions/purchases';
import { sendHttpError } from '../errors';
import { PurchasesStore } from '../stores/purchases';
import { isoDateToTimestamp } from '../utils';

const fetchLatestPurchase: (collection: PurchasesCollection) => ApiTransaction = (collection: PurchasesCollection) => {
  return Object.values(collection).sort((a, b) => {
    return isoDateToTimestamp(b.expirationDate) - isoDateToTimestamp(a.expirationDate);
  }).firstOrDefault()!;
};

export const getLastSubscription = (purchasesStore: PurchasesStore) => (req: Request, res: Response, next: Next) => {

  purchasesStore.getCollection(req.params.userId, (err, collection) => {
    if (err) {
      return sendHttpError(next, new InternalServerError('failed to get the collection'));
    }

    //if collection exists in our redis and its not empty then
    //send the latest not expired one.
    if (collection !== null && Object.keys(collection).length > 0) {
      res.send(fetchLatestPurchase(collection));
      return next();
    }
    //we need to fetch the collection from the billing.
    //not found in our redis cache.

    //TODO: FETCH FROM BILLING

    res.send(200);
    next();

  });
};
