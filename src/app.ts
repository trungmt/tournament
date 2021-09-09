import express from 'express';
import authRouter from './routers/auth/auth';
import adminRouter from './routers/admin/admin';
import { logException, responseException } from './middlewares/exception';
require('./db/mongoose');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use('/auth', authRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.send('Welcome to Euro 2020 portal');
});

app.use(logException);
app.use(responseException);

export default app;
