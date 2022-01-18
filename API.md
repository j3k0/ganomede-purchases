# Ganomede-puchases REST API

# Subscription [/purchases/v1/auth/:token/subscription]

## Retrieve recent subscription [GET]

Parameters:

  - `token` (`string`, required) — authentication token for the user;

Will retrieve the status of the identified users' subscription, the one with the latest expirationDate.

### response [401] Unauthorized

if the token is invalid.

### response [200] OK

A Subscription Status object:

``` json
  {
    "productId":"apple:monthly_subcscription",
    "platform":"apple",
    "purchaseId":"apple:1000000532000112",
    "purchaseDate":"2019-07-29T17:14:00.000Z",
    "expirationDate":"2019-07-29T17:19:00.000Z"
  }
```

# Webhooks [/purchases/v1/webhooks/fovea]

## Receive webhook calls from Fovea [POST]

Stores the user's "Purchase Collection" object in a Redis cache.

### response [401] Unauthorized

Checks that the provided password matches the FOVEA_BILLING_SECRET_KEY configuration.

### response [200] OK

### body (application/json)

The subscription status corresponds to the "Purchase" object in Fovea.Billing. See https://billing.fovea.cc/documentation/api/customer-purchases/

``` json
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
