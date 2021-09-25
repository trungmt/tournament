import express from 'express';
import cron from 'node-cron';
import authRouter from './routers/auth/auth';
import adminRouter from './routers/admin/admin';
import { logException, responseException } from './middlewares/exception';
import { removeOldTempFiles } from './middlewares/upload';
require('./db/mongoose'); // move to providers/

const app = express();

// TODO: make it a provider class that inject response function to app object
// same as https://github.com/GeekyAnts/express-typescript/blob/7bb6ac09ca0270cb82a1730d9bb8d6efb89c999e/src/middlewares/Kernel.ts
const port = process.env.PORT || 8080;

app.use(express.json());
app.use('/auth', authRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
  res.send('Welcome to Euro 2020 portal');
});

app.use(logException);
app.use(responseException);

cron.schedule('57 1 * * *', async () => removeOldTempFiles(86400000));

export default app;
