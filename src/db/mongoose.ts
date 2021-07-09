import mongoose from 'mongoose';
import { MONGOOSE_CONNECTION_URL } from '../util/secret';

mongoose.connect(MONGOOSE_CONNECTION_URL!, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
