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
  Alice_Details, Zia_Details,
  alice_collection, BOB_TOKEN,
  collectionWithCompareRecentOne,
  Alice_Purchase_key,
  Zia_Purchase_key
} from './dummy-data';
const calledOnce = { times: 1, ignoreExtraArgs: true };




describe('purchases.get', () => {

  let purchasesRedisClient: RedisClient;
  let authdbClient: AuthdbClient
  let server: restify.Server;
  beforeEach((done) => {
    server = createServer();
    authdbClient = td.object(['getAccount', 'addAccount']);
    purchasesRedisClient = td.object<RedisClient>();
    const purchasesStore: PurchasesStore = new PurchasesStore(purchasesRedisClient);

    td.when(purchasesRedisClient.get(Alice_Purchase_key, td.callback))
      .thenCallback(null, JSON.stringify(alice_collection));

    td.when(authdbClient.getAccount(Alice_Details.token, td.callback))
      .thenCallback(null, Alice_Details.userDetails);
    routes.addPurchasesRouter(purchasesStore)(config.http.prefix, server, authdbClient);
    server.listen(done);
  });
  afterEach(done => server.close(done));

  it('add the route `/purchases/v1/auth/:token/subscription` [GET] to the server', (done) => {
    const route = Object.values(server.router.getRoutes()).find((r) => r.path === '/purchases/v1/auth/:token/subscription' && r.method === 'GET');
    expect(route).to.be.not.undefined;
    done();
  });

  it('should respond', (done) => {
    supertest(server)
      .get(`/purchases/v1/auth/${Alice_Details.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        done();
      });
  });

  it('fails when token is invalid', (done) => {
    td.when(authdbClient.getAccount(BOB_TOKEN, td.callback))
      .thenCallback('not found', null);
    supertest(server)
      .get(`/purchases/v1/auth/${BOB_TOKEN}/subscription`)
      .expect(500)
      .end((err, res) => {
        expect(res.body.code).to.be.eqls('InternalServer');
        done();
      });
  });

  it('fetch the purchases collection from redis and return', (done) => {
    supertest(server)
      .get(`/purchases/v1/auth/${Alice_Details.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body).to.be.eqls(alice_collection["apple:yearly_subcscription"]);
        verify(purchasesRedisClient.get(Alice_Purchase_key, td.matchers.anything()), calledOnce);
        done();
      });
  });

  it('fetch the purchases collection from billing in case the existing was empty');

  it('store the purchases collection in current redis in case the existing was empty');

  it('returns the recent subscription status object', (done) => {
    td.when(authdbClient.getAccount(Zia_Details.token, td.callback))
      .thenCallback(null, Zia_Details.userDetails);
    td.when(purchasesRedisClient.get(Zia_Purchase_key, td.callback))
      .thenCallback(null, JSON.stringify(collectionWithCompareRecentOne));

    supertest(server)
      .get(`/purchases/v1/auth/${Zia_Details.token}/subscription`)
      .expect(200)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.body).to.be.eqls(collectionWithCompareRecentOne["apple:very_last_subcscription"]);
        verify(purchasesRedisClient.get(Zia_Purchase_key, td.matchers.anything()), calledOnce);
        done();
      });
  });

  it('stores the object in redis with TTL')


});


