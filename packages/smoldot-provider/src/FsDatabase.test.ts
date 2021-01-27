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

test('load: loads previously saved state', t=> {
  const db = new FsDatabase('test');
  const state = '{ "test": "state" }';
  db.save(state);
  const loaded = db.load();
  t.is(state, loaded);
  db.delete();

  const error: NodeJS.ErrnoException = t.throws(() => stat(testDatabase), {instanceOf: Error});
  t.is(error.code, 'ENOENT');
});

test('load: returns empty string when there is no state', t=> {
  const db = new FsDatabase('test');
  const loaded = db.load();
  t.is(loaded, '');
});
