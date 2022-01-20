import { PurchasesCollection } from '../src/definitions/purchases';
import { config } from '../config';


export const empty_collection: PurchasesCollection = {};

export const alice_collection: PurchasesCollection = {
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

export const collectionWithCompareRecentOne: PurchasesCollection = Object.assign({}, alice_collection, {
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

export const Alice_Details = {
  token: 'alice-token',
  userDetails: {
    username: 'alice',
    email: 'alice@email.com'
  }
};


export const Zia_Details = {
  token: 'zia-token',
  userDetails: {
    username: 'zia',
    email: 'zia@email.com'
  }
};

export const BOB_TOKEN = 'bob-token';

export const webHookPostData = {
  type: "purchases.updated",
  applicationUsername: Alice_Details.userDetails.username,
  purchases: alice_collection,
  password: config.secret
};
export const Alice_Purchase_key = `${config.purchasesRedisPrefixKey}:${Alice_Details.userDetails.username}`;
export const Zia_Purchase_key = `${config.purchasesRedisPrefixKey}:${Zia_Details.userDetails.username}`;
