import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import FsDatabase from './FsDatabase';

// workaround for global __dirname not being defined when using
// node experimental module resolution
// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
const __dirname = dirname(fileURLToPath(import.meta.url));

const TEST_DB_PATH = join(__dirname, 'test-db.json');

export default TEST_DB_PATH;