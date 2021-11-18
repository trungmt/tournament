import mongoose from 'mongoose';
import { MONGOOSE_CONNECTION_URL } from '../services/secret';

mongoose.connect(MONGOOSE_CONNECTION_URL!, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});
