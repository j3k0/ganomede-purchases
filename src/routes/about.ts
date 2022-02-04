
import { Server } from 'restify';
import { sendAbout } from '../controllers/about';


export const addRoute = (prefix: string, server: Server) => {
  server.get('/about', sendAbout);
  server.get(`${prefix}/about`, sendAbout);
};
