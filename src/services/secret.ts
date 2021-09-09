export const MONGOOSE_CONNECTION_URL = process.env.MONGOOSE_CONNECTION_URL;
if (!MONGOOSE_CONNECTION_URL) {
  console.log('Error: no MONGOOSE_CONNECTION_URL config');
  process.exit(1);
}
