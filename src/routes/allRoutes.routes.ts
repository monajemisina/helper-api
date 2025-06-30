import { Router } from 'express';
import indexRouter from '../routers/index';
import scriptRouter from '../routers/script.router'
import vendorRouter from '../routers/vendor.router';
import dashboardRouter from '../routers/dashboard.router';
import policyRouter from '../routers/policy.router'

const router = Router();

router
    .use(indexRouter)
    .use(scriptRouter)
    .use(vendorRouter)
    .use(policyRouter)
    .use(dashboardRouter)



export default router;
