# ganomede-subscriptions

Subscriptions API.

Relations
---------

 * "SubscriptionsDB" (Redis) -> a cache to store the subscription status for each user.
 * "AuthDB" (Redis) -> to store the subscription status for each user.
   * see https://github.com/j3k0/node-authdb

Configuration
-------------

Variables available for service configuration.

 * `FOVEA_BILLING_SECRET_KEY` - The secret API key from Fovea.Billing
 * `REDIS_SUBSCRIPTIONS_PORT_6379_TCP_ADDR` - IP of the SubscriptionsDB redis database.
 * `REDIS_SUBSCRIPTIONS_PORT_6379_TCP_PORT` - Port of the SubscriptionsDB redis database.
 * `REDIS_SUBSCRIPTIONS_TTL` - Default TTL of the SubscriptionsDB redis database.
 * `REDIS_AUTH_PORT_6379_TCP_ADDR` - IP of the AuthDB redis
 * `REDIS_AUTH_PORT_6379_TCP_PORT` - Port of the AuthDB redis

SubscriptionsDB
---------------

 * Contains a store:
   * `"fovea:user:USER_ID"` -> Purchase object from Fovea.

API
---

## /subscriptions/v1/auth/:token/status [GET]

Status of the identified users' subscription.

### response [200]

A **Subscription Status** object (cf Data Types).

```json
{
    "productId":"apple:monthly_subcscription",
    "platform":"apple",
    "purchaseId":"apple:1000000532000112",
    "purchaseDate":"2019-07-29T17:14:00.000Z",
    "expirationDate":"2019-07-29T17:19:00.000Z"
}
```

### implementation details

The endpoint will check in the SubscriptionsDB for the existance of a Purchase object.

If not present, it'll fetch it and update the SubscriptionsDB, using Fovea's customer purchase API: https://billing.fovea.cc/documentation/api/customer-purchases/ - Cf the webhook endpoint below for more info about storing Purchases, the logic has to be the same in all aspects.

The object is then returned in JSON.


## /subscriptions/v1/webhooks/fovea [POST]

Receive webhook calls from Fovea. See https://billing.fovea.cc/documentation/webhook/

 * Checks that the provided password matches the `FOVEA_BILLING_SECRET_KEY` configuration.
 * Stores the user's "Purchase" object in a Redis cache.

### reponse [200]

### implementation details

The Purchase object is stored in redis with the key `"fovea:user:USER_ID"` (replace `USER_ID` with the appropriate one).

Object stored in redis use the TTL defined by `REDIS_SUBSCRIPTIONS_TTL`.


Data Types
----------

As this API is heavily dependant on Fovea.Billing, the data types match very closely.

the [Fovea.Billing documentation](https://billing.fovea.cc/documentation/) is a good reference for details.

## Subscription Status

The subscription status corresponds to the "Purchase" object in Fovea.Billing. See https://billing.fovea.cc/documentation/api/customer-purchases/

Example:

```json
{
    "sandbox":false,
    "productId":"apple:monthly_subcscription",
    "platform":"apple",
    "purchaseId":"apple:1000000532000112",
    "purchaseDate":"2019-07-29T17:14:00.000Z",
    "expirationDate":"2019-07-29T17:19:00.000Z",
    "cancelationReason":"Customer",
    "renewalIntent":"Lapse"
}
```
