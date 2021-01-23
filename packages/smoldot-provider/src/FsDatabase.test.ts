import test from 'ava';
import { join } from 'path';
import { readFileSync as read, statSync as stat } from 'fs';
import { FsDatabase } from './FsDatabase';

const testDatabase = join(process.cwd(), '.chains', 'test.json');

test('saves and deletes state', t=> {
  const db = new FsDatabase('test');
  const state = '{ "test": "state" }';
  db.save(state);
  const saved = read(testDatabase, { encoding: 'utf-8' });
  t.is(state, saved);
  db.delete();

  const error: NodeJS.ErrnoException = t.throws(() => stat(testDatabase), {instanceOf: Error});
  t.is(error.code, 'ENOENT');
});
