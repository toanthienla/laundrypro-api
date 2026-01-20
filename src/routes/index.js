import express from 'express';
import { userRoute } from './userRoute';

const Router = express.Router();

Router.use('/users', userRoute);

export default Router;