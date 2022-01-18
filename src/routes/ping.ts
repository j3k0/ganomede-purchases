
import { Server } from 'restify';
import { get, head } from '../controllers/ping';

export const addRoute = (prefix: string, server: Server) => {
  const url = `${prefix}/ping/:token`;

  server.get(url, get);
  server.head(url, head);
};
