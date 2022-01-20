import { expect } from 'chai';
import supertest from 'supertest';
import { createServer } from '../src/server';
import routes from '../src/routes';
import { config } from '../config';
import restify from 'restify';
import td, { verify } from 'testdouble';
import { RedisClient } from 'redis';
import { PurchasesStore } from '../src/stores/purchases';
import {
  Alice_Details, Zia_Details,
  alice_collection, BOB_TOKEN,
  collectionWithCompareRecentOne,
  empty_collection,
  Alice_Purchase_key,
  webHookPostData
} from './dummy-data';
const calledOnce = { times: 1, ignoreExtraArgs: true };




describe('purchases.webhooks.post', () => {

  let purchasesRedisClient: RedisClient;
  let server: restify.Server;
  beforeEach((done) => {
    server = createServer();
    purchasesRedisClient = td.object<RedisClient>();
    const purchasesStore: PurchasesStore = new PurchasesStore(purchasesRedisClient);

    routes.addWebhooksRouter(purchasesStore)(config.http.prefix, server);
    server.listen(done);
  });
  afterEach(done => server.close(done));

  it('add the route `/purchases/v1/webhooks/fovea` [POST] to the server', (done) => {
    const route = Object.values(server.router.getRoutes()).find((r) => r.path === '/purchases/v1/webhooks/fovea' && r.method === 'POST');
    expect(route).to.be.not.undefined;
    done();
  });

  it('should respond', (done) => {
    supertest(server)
      .post('/purchases/v1/webhooks/fovea')
      .send({})
      .expect(401)
      .end((err, res) => {
        expect(err).to.be.null;
        done();
      });
  });

  it('fails when password doesnt match the fover-billing-secret', (done) => {
    supertest(server)
      .post('/purchases/v1/webhooks/fovea')
      .send({ password: '423424242424' })
      .expect(401)
      .end((err, res) => {
        expect(res.body.code).to.be.eqls('InvalidCredentialsError');
        done();
      });
  });
  it('stores the purchases collection in redis cache.', (done) => {
    td.when(purchasesRedisClient.set(Alice_Purchase_key, td.matchers.anything(), td.matchers.anything(), td.callback))
      .thenCallback(null, "OK");

    supertest(server)
      .post('/purchases/v1/webhooks/fovea')
      .send(webHookPostData)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        verify(purchasesRedisClient.set(Alice_Purchase_key,
          JSON.stringify(webHookPostData.purchases)), calledOnce);

        done();
      });
  });

  it('stores an empty object in case the collection was empty.', (done) => {
    td.when(purchasesRedisClient.set(Alice_Purchase_key, td.matchers.anything(),
      td.matchers.anything(), td.callback))
      .thenCallback(null, "OK");

    const tempPostData = Object.assign({}, webHookPostData);
    tempPostData.purchases = {};

    supertest(server)
      .post('/purchases/v1/webhooks/fovea')
      .send(tempPostData)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        verify(purchasesRedisClient.set(Alice_Purchase_key,
          '{}'), calledOnce);

        done();
      });
  });

  it('stores the object in redis with TTL', (done) => {
    td.when(purchasesRedisClient.set(Alice_Purchase_key, td.matchers.anything(),
      td.matchers.anything(), td.callback))
      .thenCallback(null, "OK");


    supertest(server)
      .post('/purchases/v1/webhooks/fovea')
      .send(webHookPostData)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        verify(purchasesRedisClient.expire(Alice_Purchase_key, td.matchers.anything()), calledOnce);
        done();
      });
  })

});
