import { Server } from 'restify';
import { getLastSubscription } from '../controllers/purchases';
import { AuthdbClient, requireAuth } from '../middlewares/authentication';
import { PurchasesStore } from '../stores/purchases';

export const addRoute = (purchasesStore: PurchasesStore) => (prefix: string, server: Server, authdbClient: AuthdbClient | null) => {

  server.get(`${prefix}/auth/:token/subscription`,
    requireAuth({ authdbClient, secret: '' }),
    getLastSubscription(purchasesStore))
};
