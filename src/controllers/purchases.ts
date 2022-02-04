import { ApiCollection, V2, ApiPurchase } from 'iaptic';
import { Request, Response, Next } from 'restify';
import { InternalServerError } from 'restify-errors';
import { sendHttpError } from '../errors';
import { PurchasesStore } from '../stores/purchases';
import { isoDateToTimestamp } from '../utils';

const latestSubscription = (collection: ApiCollection): ApiPurchase => {
  return Object.values(collection)
    .filter(x => x.expirationDate) // only keep transactions related to subscriptions
    .sort((a, b) => {
      return isoDateToTimestamp(b.expirationDate) - isoDateToTimestamp(a.expirationDate);
    })[0];
};

export const getLastSubscription = (purchasesStore: PurchasesStore, customersClient: V2.CustomersClient) => (req: Request, res: Response, next: Next) => {

  purchasesStore.getCollection(req.params.userId, (err, collection) => {
    if (err) {
      req.log.warn({ err }, 'failed to get the collection');
    }

    //if collection exists in our redis and its not empty then
    //send the latest not expired one.
    if (collection !== null && Object.keys(collection).length > 0) {
      res.send(latestSubscription(collection));
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
          req.log.warn({ err: err3 }, 'failed to save the collection in redis');
        }

        //return final response.
        res.send(latestSubscription(apiPurchasesCollection));
        next();
      })

    });
  });
};
