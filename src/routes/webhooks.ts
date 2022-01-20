import { Server } from 'restify';
import { postWebhooks } from '../controllers/webhooks';
import { PurchasesStore } from '../stores/purchases';
import { requireSecret } from '../middlewares/authentication';

export const addRoute = (purchasesStore: PurchasesStore) => (prefix: string, server: Server) => {

  server.post(`${prefix}/webhooks/fovea`,
    requireSecret,
    postWebhooks(purchasesStore));
};
