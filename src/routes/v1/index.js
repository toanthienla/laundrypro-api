import express from 'express';
import { userRoute } from '~/routes/v1/userRoute';
import { serviceRoute } from '~/routes/v1/serviceRoute';

const Router = express.Router();

Router.use('/users', userRoute);
Router.use('/services', serviceRoute);

export const APIs_V1 = Router;