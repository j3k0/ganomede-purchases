/**
 * Purchases Store class: used to store and manage the purchases collection
 * in redis we will store the full collection stringified under a key 'purchases:fovea:user:USER_ID':
 */
import { RedisClient } from "redis";
import { config } from '../../config';
import { PurchasesCollection } from "../definitions/purchases";

export class PurchasesStore {

  redis: RedisClient;
  constructor(redisClient: RedisClient) {
    this.redis = redisClient;
  }

  private keyName(userid: string) {
    return `${config.purchasesRedisPrefixKey}:${userid}`;
  }

  // add or update the collection of userid.
  addCollection(userId: string, collection: PurchasesCollection, callback: (e: Error | null, res?: string) => void) {
    this.redis.set(this.keyName(userId), JSON.stringify(collection), 'NX', (err, results) => {
      if (err)
        return callback(err);

      // If the key already exists, it's not an error... The endpoint allows this.
      // if (results[0] === null)
      //   return callback(new Error('Key already exists'), results);

      callback(null, results);
    });
    //set the expiration of the key based on the config, by default its 3 days only.
    this.redis.expire(this.keyName(userId), 3600 * 24 * config.redisPurchases.ttl);
  }

  //we need to get the collection of subscription by the userid
  getCollection(userId: string, callback: (err: Error | null, result: PurchasesCollection | null) => void) {
    this.redis.get(this.keyName(userId), (err: Error | null, result: string | null) => {
      if (err)
        return callback(err, null);

      if (result === null)
        return callback(err, null);

      callback(null, JSON.parse(result));
    });
  }
}
