import test from 'ava';
import { join } from 'path';
import { readFileSync as read, statSync as stat } from 'fs';
import FsDatabase from './FsDatabase';

import TEST_DB_PATH from './TestDatabasePath';

test('saves and deletes state', t=> {
  const db = new FsDatabase(TEST_DB_PATH);
  const state = '{ "test": "state" }';
  db.save(state);
  const saved = read(TEST_DB_PATH, { encoding: 'utf-8' });
  t.is(state, saved);
  db.delete();

  const error: NodeJS.ErrnoException = t.throws(() => {
    stat(TEST_DB_PATH)
  }, {instanceOf: Error});
  t.is(error.code, 'ENOENT');
});
