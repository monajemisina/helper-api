import express, { Request, Response, NextFunction } from 'express';
import routes from './routes/allRoutes.routes';

const app = express();

app.use(express.json());
app.use('/', routes);

// ─── CATCH‐ALL MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Cannot ${req.method} ${req.originalUrl}`);
  (err as any).status = 404;
  next(err);
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

export default app;
