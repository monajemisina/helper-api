import { Router } from 'express';
import indexRouter from '../routers/index';
import scriptRouter from '../routers/script.router'
import vendorRouter from '../routers/vendor.router';
import dashboardRouter from '../routers/dashboard.router';

const router = Router();

router
.use(indexRouter)
.use(scriptRouter)
.use(vendorRouter)
.use(dashboardRouter)



export default router;
