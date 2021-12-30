import configs from '../configs';
export const MONGOOSE_CONNECTION_URL = configs.mongooseConnectionURL;
if (!MONGOOSE_CONNECTION_URL) {
  console.log('Error: no MONGOOSE_CONNECTION_URL config');
  process.exit(1);
}
