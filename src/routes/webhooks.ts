import { Server } from 'restify';
import { postWebhooks } from '../controllers/webhooks';
import { PurchasesStore } from '../stores/purchases';

export const addRoute = (purchasesStore: PurchasesStore) => (prefix: string, server: Server) => {

  server.post(`${prefix}/webhooks/fovea`,
    postWebhooks(purchasesStore));
};
