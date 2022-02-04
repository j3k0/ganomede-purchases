import { expect } from 'chai';
import supertest from 'supertest';
import { createServer } from '../src/server';
import routes from '../src/routes';
import { config } from '../config';
import td, { verify } from 'testdouble';
import { AuthdbClient } from '../src/middlewares/authentication';
import { RedisClient } from 'redis';
import { PurchasesStore } from '../src/stores/purchases';
import restify from 'restify';
import {
  aliceDetails, ziaDetails,
  aliceCollection, bobToken,
  collectionWithCompareRecentOne,
  alicePurchaseKey,
  ziaPurchaseKey,
  getCustomerPurchasesResultData
} from './dummy-data';
import { V2 } from 'iaptic';
const calledOnce = { times: 1, ignoreExtraArgs: true };


describe('purchases.get', () => {

  let purchasesRedisClient: RedisClient;
  let authdbClient: AuthdbClient
  let server: restify.Server;
  let customerClient: V2.CustomersClient;
  beforeEach((done) => {
    server = createServer();
    authdbClient = td.object(['getAccount', 'addAccount']);
    purchasesRedisClient = td.object<RedisClient>();
    customerClient = td.object<V2.CustomersClient>();
    const purchasesStore: PurchasesStore = new PurchasesStore(purchasesRedisClient);

    td.when(purchasesRedisClient.get(alicePurchaseKey, td.callback))
      .thenCallback(null, JSON.stringify(aliceCollection));

    td.when(authdbClient.getAccount(aliceDetails.token, td.callback))
      .thenCallback(null, aliceDetails.userDetails);
    routes.addPurchasesRouter(purchasesStore, customerClient)(config.http.prefix, server, authdbClient);
    server.listen(done);
  });
  afterEach(done => server.close(done));

  it('adds the route `/purchases/v1/auth/:token/subscription` [GET] to the server', (done) => {
    const route = Object.values(server.router.getRoutes()).find((r) => r.path === '/purchases/v1/auth/:token/subscription' && r.method === 'GET');
    expect(route).to.be.not.undefined;
    done();
  });

  it('should respond', (done) => {
    supertest(server)
      .get(`/purchases/v1/auth/${aliceDetails.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        done();
      });
  });

  it('fails when token is invalid', (done) => {
    td.when(authdbClient.getAccount(bobToken, td.callback))
      .thenCallback('not found', null);
    supertest(server)
      .get(`/purchases/v1/auth/${bobToken}/subscription`)
      .expect(500)
      .end((err, res) => {
        expect(res.body.code).to.be.eqls('InternalServer');
        done();
      });
  });

  it('fetch the purchases collection from redis and return', (done) => {
    supertest(server)
      .get(`/purchases/v1/auth/${aliceDetails.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body).to.be.eqls(aliceCollection["apple:yearly_subcscription"]);
        verify(purchasesRedisClient.get(alicePurchaseKey, td.matchers.anything()), calledOnce);
        done();
      });
  });

  it('returns the recent subscription status object', (done) => {
    td.when(authdbClient.getAccount(ziaDetails.token, td.callback))
      .thenCallback(null, ziaDetails.userDetails);
    td.when(purchasesRedisClient.get(ziaPurchaseKey, td.callback))
      .thenCallback(null, JSON.stringify(collectionWithCompareRecentOne));

    supertest(server)
      .get(`/purchases/v1/auth/${ziaDetails.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body).to.be.eqls(collectionWithCompareRecentOne["apple:very_last_subcscription"]);
        verify(purchasesRedisClient.get(ziaPurchaseKey, td.matchers.anything()), calledOnce);
        done();
      });
  });

  const testStubs = (resultData, customerClientError: Error | null = null) => {
    td.when(authdbClient.getAccount(ziaDetails.token, td.callback))
      .thenCallback(null, ziaDetails.userDetails);

    td.when(purchasesRedisClient.get(ziaPurchaseKey, td.callback))
      .thenCallback(null, JSON.stringify({}));

    td.when(customerClient.getCustomerPurchases(ziaDetails.userDetails.username, td.callback))
      .thenCallback(customerClientError, resultData);

    td.when(purchasesRedisClient.set(ziaPurchaseKey, td.matchers.anything(), td.matchers.anything(), td.matchers.anything(), td.callback))
      .thenCallback(null, "OK");
  };

  it('fetch the purchases collection from billing in case the existing was empty', (done) => {

    testStubs(getCustomerPurchasesResultData);

    supertest(server)
      .get(`/purchases/v1/auth/${ziaDetails.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        verify(customerClient.getCustomerPurchases(td.matchers.anything(), td.matchers.anything()), calledOnce);
        done();
      });
  });

  it('stores the purchases collection in current redis in case the existing was empty', (done) => {

    testStubs(getCustomerPurchasesResultData);

    supertest(server)
      .get(`/purchases/v1/auth/${ziaDetails.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        verify(purchasesRedisClient.set(td.matchers.anything(), td.matchers.anything(), td.matchers.anything(), td.matchers.anything()), calledOnce);
        done();
      });
  });

  it('stores the empty purchases collection in current redis', (done) => {

    testStubs({});

    supertest(server)
      .get(`/purchases/v1/auth/${ziaDetails.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        verify(purchasesRedisClient.set(td.matchers.anything(), td.matchers.anything(), td.matchers.anything(), td.matchers.anything()), calledOnce);
        done();
      });
  });

  it('returns 500 error when the customer-client failed', (done) => {

    testStubs({}, new Error('Not found'));

    supertest(server)
      .get(`/purchases/v1/auth/${ziaDetails.token}/subscription`)
      .expect(500)
      .end((err, res) => {
        expect(res.body.message).to.be.contains('failed to get the data from CustomerClient');
        done();
      });
  });

  it('stores the object in redis with TTL', (done) => {
    testStubs(getCustomerPurchasesResultData);

    supertest(server)
      .get(`/purchases/v1/auth/${ziaDetails.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        verify(purchasesRedisClient.set(td.matchers.anything(), td.matchers.anything(),
          td.matchers.anything(), 3600 * 24 * config.redisPurchases.ttlDays), calledOnce);
        done();
      });
  });
});


describe('test purchases.get with real CustomerClient', () => {
  let purchasesRedisClient: RedisClient;
  let authdbClient: AuthdbClient
  let server: restify.Server;
  let customerClient: V2.CustomersClient;
  beforeEach((done) => {
    server = createServer();
    authdbClient = td.object(['getAccount', 'addAccount']);
    purchasesRedisClient = td.object<RedisClient>();
    customerClient = new V2.CustomersClient({
      secretKey: config.secret!,
      appName: config.appName
    })
    const purchasesStore: PurchasesStore = new PurchasesStore(purchasesRedisClient);

    td.when(purchasesRedisClient.get(alicePurchaseKey, td.callback))
      .thenCallback(null, JSON.stringify(aliceCollection));

    td.when(authdbClient.getAccount(aliceDetails.token, td.callback))
      .thenCallback(null, aliceDetails.userDetails);
    routes.addPurchasesRouter(purchasesStore, customerClient)(config.http.prefix, server, authdbClient);
    server.listen(done);
  });
  afterEach(done => server.close(done));

  it('returns an error from the api when using invalid secret and appname', (done) => {
    td.when(authdbClient.getAccount(ziaDetails.token, td.callback))
      .thenCallback(null, ziaDetails.userDetails);
    td.when(purchasesRedisClient.get(ziaPurchaseKey, td.callback))
      .thenCallback(null, JSON.stringify({}));
    td.when(purchasesRedisClient.set(ziaPurchaseKey, td.matchers.anything(), td.matchers.anything(), td.callback))
      .thenCallback(null, "OK");

    supertest(server)
      .get(`/purchases/v1/auth/${ziaDetails.token}/subscription`)
      .expect(500)
      .end((err, res) => {
        expect(res.body.message).to.be.contains('failed to get the data from CustomerClient');
        done();
      });
  })

});
