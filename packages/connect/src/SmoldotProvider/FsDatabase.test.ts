import { join } from 'path';
import { readFileSync as read, statSync as stat } from 'fs';
import { FsDatabase } from './FsDatabase';

const testDatabase = join(process.cwd(), '.chains', 'test.json');

test('saves and deletes state', () => {
  const db = new FsDatabase('test');
  const state = '{ "test": "state" }';
  db.save(state);
  const saved = read(testDatabase, { encoding: 'utf-8' });
  expect(state).toBe(saved);
  db.delete();

  expect(() => stat(testDatabase)).toThrowError('ENOENT');
});

test('load: loads previously saved state', () => {
  const db = new FsDatabase('test');
  const state = '{ "test": "state" }';
  db.save(state);
  const loaded = db.load();
  expect(state).toBe(loaded);
  db.delete();

  expect(() => stat(testDatabase)).toThrowError('ENOENT');
});

test('load: returns empty string when there is no state', () => {
  const db = new FsDatabase('test');
  const loaded = db.load();
  expect(loaded).toBe('');
});