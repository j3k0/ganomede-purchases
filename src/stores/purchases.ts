/**
 * Purchases Store class: used to store and manage the purchases collection
 * in redis we will store the full collection stringified under a key 'purchases:fovea:user:USER_ID':
 */
import { ApiCollection } from "iaptic";
import { RedisClient } from "redis";
import { config } from '../../config';

export class PurchasesStore {

  redis: RedisClient;
  constructor(redisClient: RedisClient) {
    this.redis = redisClient;
  }

  private keyName(userid: string) {
    return `${config.purchasesRedisPrefixKey}:${userid}`;
  }

  // add or update the collection of userid.
  addCollection(userId: string, collection: ApiCollection, callback: (e: Error | null, res?: string) => void) {
    //set the expiration of the key based on the config, by default its 3 days only.
    this.redis.set(this.keyName(userId), JSON.stringify(collection), 'EX',
      3600 * 24 * config.redisPurchases.ttlDays, (err, results) => {
        if (err)
          return callback(err);

        // If the key already exists, it's not an error... The endpoint allows this.
        // if (results[0] === null)
        //   return callback(new Error('Key already exists'), results);

        callback(null, results);
      });
  }

  //we need to get the collection of subscription by the userid
  getCollection(userId: string, callback: (err: Error | null, result: ApiCollection | null) => void) {
    this.redis.get(this.keyName(userId), (err: Error | null, result: string | null) => {
      if (err)
        return callback(err, null);

      if (result === null)
        return callback(err, null);

      try {
        return callback(null, JSON.parse(result));
      } catch (e) {
        return callback(e as Error, null);
      }
    });
  }
}
