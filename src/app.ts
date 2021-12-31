import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import cookieParser from 'cookie-parser';
import authRouter from './routers/auth/auth';
import adminRouter from './routers/admin/admin';
import { logException, responseException } from './middlewares/exception';
import { removeOldTempFiles } from './services/FileService';
import path from 'path';
import { checkRequiredEnv } from './configs';

checkRequiredEnv();

require('./db/mongoose'); // move to providers/

const app = express();

// TODO: make it a provider class that inject response function to app object
// same as https://github.com/GeekyAnts/express-typescript/blob/7bb6ac09ca0270cb82a1730d9bb8d6efb89c999e/src/middlewares/Kernel.ts

var dir = path.join(__dirname, '../uploads');

app.use(express.static(dir));
const corsConfig = {
  // Configures the Access-Control-Allow-Origin
  origin:
    process.env.NODE_ENV !== 'production'
      ? `http://localhost:3000`
      : process.env.CORS_ORIGIN,

  // Configures the Access-Control-Allow-Methods
  methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',

  //Configures the Access-Control-Allow-Headers
  allowedHeaders:
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization',

  // Configures the Access-Control-Allow-Credentials
  credentials: true,

  //Configures the Access-Control-Expose-Headers
  exposedHeaders: 'Content-Range,X-Content-Range,Authorization',

  // Provides a status code to use for successful OPTIONS requests
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors(corsConfig));
app.use(cookieParser());

const basicAPIURL = '/api/v1';

app.use(`${basicAPIURL}/auth`, authRouter);
app.use(`${basicAPIURL}/admin`, adminRouter);

app.get('/', (req, res) => {
  res.send('Welcome to Euro 2020 portal');
});

app.use(logException);
app.use(responseException);

cron.schedule('57 1 * * *', async () => removeOldTempFiles(86400000));

export default app;
