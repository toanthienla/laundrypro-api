import express from 'express';
import { userRoute } from '~/routes/v1/userRoute';
import { serviceRoute } from '~/routes/v1/serviceRoute';
import { orderRoute } from '~/routes/v1/orderRoute';

const Router = express.Router();

Router.use('/users', userRoute);
Router.use('/services', serviceRoute);
Router.use('/orders', orderRoute);

export const APIs_V1 = Router;