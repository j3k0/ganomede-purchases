import { ApiPurchaseCollection } from '../src/definitions/purchases';
import { config } from '../config';


export const emptyCollection: ApiPurchaseCollection = {};

export const aliceCollection: ApiPurchaseCollection = {
  "apple:monthly_subcscription": {
    productId: "apple:monthly_subcscription",
    platform: "apple",
    purchaseId: "apple:1000000532000112",
    purchaseDate: "2019-07-29T17:14:00.000Z",
    expirationDate: "2019-07-29T17:19:00.000Z",
    transactionId: '0000',
    amountUSD: null,
    amountMicros: null,
    currency: null
  },
  "apple:yearly_subcscription": {
    productId: "apple:yearly_subcscription",
    platform: "apple",
    purchaseId: "apple:1000000532003112",
    purchaseDate: "2020-07-29T17:14:00.000Z",
    expirationDate: "2020-07-29T17:19:00.000Z",
    transactionId: '0010',
    amountUSD: null,
    amountMicros: null,
    currency: null
  }
};

export const collectionWithCompareRecentOne: ApiPurchaseCollection = Object.assign({}, aliceCollection, {
  "apple:very_last_subcscription": {
    productId: "apple:very_last_subcscription",
    platform: "apple",
    purchaseId: "apple:1000000532003112",
    purchaseDate: "2021-07-29T17:14:00.000Z",
    expirationDate: "2021-07-29T17:19:00.000Z",
    transactionId: '0012',
    amountUSD: null,
    amountMicros: null,
    currency: null
  }
});

export const aliceDetails = {
  token: 'alice-token',
  userDetails: {
    username: 'alice',
    email: 'alice@email.com'
  }
};


export const ziaDetails = {
  token: 'zia-token',
  userDetails: {
    username: 'zia',
    email: 'zia@email.com'
  }
};

export const bobToken = 'bob-token';

export const webHookPostData = {
  type: "purchases.updated",
  applicationUsername: aliceDetails.userDetails.username,
  purchases: aliceCollection,
  password: config.secret
};
export const alicePurchaseKey = `${config.purchasesRedisPrefixKey}:${aliceDetails.userDetails.username}`;
export const ziaPurchaseKey = `${config.purchasesRedisPrefixKey}:${ziaDetails.userDetails.username}`;

export const applicationUsername = '1E6676C70C123AA18222EF001120CAE1';
export const getCustomerPurchasesResultData = {
  applicationUsername: applicationUsername,
  purchases: {
    "apple:monthly_subcscription": {
      productId: "apple:monthly_subcscription",
      platform: "apple",
      sandbox: true,
      purchaseId: "apple:1000000532000112",
      purchaseDate: "2021-07-29T17:14:00.000Z",
      expirationDate: "2020-07-29T17:19:00.000Z",
      cancelationReason: "Customer",
      renewalIntent: "Lapse"
    },
    "google:monthly_subcscription": {
      productId: "google:monthly_subcscription",
      purchaseId: "google:GPA.0000-3444-1111-54570",
      sandbox: true,
      platform: "google",
      purchaseDate: "2018-06-21T16:00:00.000Z",
      expirationDate: "2019-06-21T16:08:00.000Z",
      cancelationReason: "Customer.Cost",
      renewalIntent: "Lapse",
      renewalIntentChangeDate: "2019-06-21T16:05:00.000Z",
      isExpired: true
    }
  }
};
