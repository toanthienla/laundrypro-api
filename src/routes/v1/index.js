import express from 'express';
import { userRoute } from '~/routes/v1/userRoute';
import { serviceRoute } from '~/routes/v1/serviceRoute';
import { orderRoute } from '~/routes/v1/orderRoute';
import { paymentRoute } from '~/routes/v1/paymentRoute';
import { contactRoute } from '~/routes/v1/contactRoute';

const Router = express.Router();

Router.use('/users', userRoute);
Router.use('/services', serviceRoute);
Router.use('/orders', orderRoute);
Router.use('/payments', paymentRoute);
Router.use('/contacts', contactRoute);

export const APIs_V1 = Router;