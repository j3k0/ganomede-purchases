import { V2 } from 'iaptic';
import { Request, Response, Next } from 'restify';
import { InternalServerError } from 'restify-errors';
import { ApiPurchaseCollection, ApiTransaction, } from '../definitions/purchases';
import { sendHttpError } from '../errors';
import { PurchasesStore } from '../stores/purchases';
import { isoDateToTimestamp } from '../utils';

const fetchLatestPurchase: (collection: ApiPurchaseCollection) => ApiTransaction = (collection: ApiPurchaseCollection) => {
  return Object.values(collection).sort((a, b) => {
    return isoDateToTimestamp(b.expirationDate) - isoDateToTimestamp(a.expirationDate);
  }).firstOrDefault()!;
};

export const getLastSubscription = (purchasesStore: PurchasesStore, customersClient: V2.CustomersClient) => (req: Request, res: Response, next: Next) => {

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
    customersClient.getCustomerPurchases(req.params.userId, (err2, customerPurchases) => {

      if (err2) {
        return sendHttpError(next, new InternalServerError('failed to get the data from CustomerClient'));
      }
      const apiPurchasesCollection = customerPurchases?.purchases ? customerPurchases?.purchases : {};

      //add collection to redis cache.
      purchasesStore.addCollection(req.params.userId, apiPurchasesCollection, (err3, result) => {
        if (err3) {
          return sendHttpError(next, new InternalServerError('failed to save the collection in redis'));
        }

        //return final response.
        res.send(fetchLatestPurchase(apiPurchasesCollection));
        next();
      })

    });
  });
};
