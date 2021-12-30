import mongoose from 'mongoose';
import configs from '../configs';

mongoose.connect(configs.mongooseConnectionURL!, {});
