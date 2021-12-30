import * as dotenv from 'dotenv';

let isError = false;
export const checkRequiredEnv = () => {
  if (!process.env.NODE_ENV) {
    isError = true;
    console.log('Error: no NODE_ENV config');
  }

  if (process.env.NODE_ENV === 'production' && !process.env.PORT) {
    isError = true;
    console.log('Error: no PORT config');
  }

  if (!process.env.MONGOOSE_CONNECTION_URL) {
    isError = true;
    console.log('Error: no MONGOOSE_CONNECTION_URL config');
  }

  if (!process.env.ACCESS_TOKEN_SECRET) {
    isError = true;
    console.log('Error: no ACCESS_TOKEN_SECRET config');
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    isError = true;
    console.log('Error: no REFRESH_TOKEN_SECRET config');
  }

  if (isError === true) {
    process.exit(1);
  }
};

const port = process.env.PORT || 3001;
const mongooseConnectionURL = process.env.MONGOOSE_CONNECTION_URL!;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const accessTokenExpirtyNumber = parseInt(accessTokenExpiry);
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!;
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '30d';
const refreshTokenExpirtyNumber = parseInt(refreshTokenExpiry);
const enableLogin = process.env.ENABLE_LOGGING || false;
const oldTempFileIgnoreList =
  process.env.OLD_TEMP_FILE_IGNORE_LIST || '.gitignore';
const uploadFileDir = process.env.UPLOAD_FILE_DIR || 'uploads/';
const uploadTempFileDir = process.env.UPLOAD_TEMP_FILE_DIR || 'uploads/';

const constants = {
  port,
  mongooseConnectionURL,
  accessTokenSecret,
  accessTokenExpiry,
  accessTokenExpirtyNumber,
  refreshTokenSecret,
  refreshTokenExpiry,
  refreshTokenExpirtyNumber,
  enableLogin,
  oldTempFileIgnoreList,
  uploadFileDir,
  uploadTempFileDir,
};

export default constants;
