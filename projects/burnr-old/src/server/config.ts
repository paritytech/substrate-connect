import dotenv from 'dotenv';
import findUp from 'find-up';

const IS_DEV = process.env.NODE_ENV !== 'production';

if (IS_DEV) {
  dotenv.config({ path: findUp.sync('.env') });
}

const SERVER_PORT = process.env.PORT || 8000;
const WEBPACK_PORT = 8085; // For dev environment only

export { IS_DEV, SERVER_PORT, WEBPACK_PORT };
