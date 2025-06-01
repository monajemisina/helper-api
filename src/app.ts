import express, { } from 'express';
import dotenv from 'dotenv';
dotenv.config(); 

import routes from './routes/allRoutes.routes';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';
const app = express();

app.use(express.json());
app.use('/', routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
