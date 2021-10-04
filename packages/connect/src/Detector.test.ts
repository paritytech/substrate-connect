/*
 * @jest-environment jsdom
 */
import { Detector } from './Detector';
import { ApiOptions } from '@polkadot/api/types';
import westmint from './specs/westend-westmint.json';
import westend2 from './specs/westend.json';

describe('Initialize Detector without extension', () => {
  const timeout = 15000;
  const extTimeout = 35000;

  test('Should connect with known chain "westend".', async () => {
    const detect = new Detector('test-uapp');
    const api = await detect.connect('westend');
    expect(api).toBeTruthy();
    detect.disconnect('westend');
  }, timeout);

  test('Should connect with known chain "polkadot".', async () => {
    const detect = new Detector('test-uapp');
    const api = await detect.connect('polkadot');
    expect(api).toBeTruthy();
    detect.disconnect('polkadot');
  }, extTimeout);

  test('Should connect with known chain westend, no chainSpecs and options', async () => {
    const chainName = 'westend';
    const detect = new Detector('test-uapp');
    const options = {} as ApiOptions;
    const api = await detect.connect(chainName, undefined, options);
    expect(api).toBeTruthy();
    detect.disconnect('westend');
  }, extTimeout);

  test('Should connect with known chain "kusama".', async () => {
    const detect = new Detector('test-uapp');
    const api = await detect.connect('kusama');
    expect(api).toBeTruthy();
    detect.disconnect('kusama');
  }, extTimeout);

  test('Should connect with unknown chain westend2 and chainSpecs.', async () => {
    const chainSpec = JSON.stringify(westend2);
    const chainName = 'westend';
    const detect = new Detector('test-uapp');
    const api = await detect.connect({ name: chainName, spec: chainSpec });
    expect(api).toBeTruthy();
    detect.disconnect(chainName);
  }, extTimeout);

  test('Should NOT connect with unknown chain westend2 and without chainSpecs.', () => {
    const chainName = 'westend';
    const detect = new Detector('test-uapp');
    void expect(detect.connect(chainName))
    .rejects
    .toThrow(`No known Chain was detected and no chainSpec was provided. Either give a known chain name ('polkadot', 'kusama', 'westend') or provide valid chainSpecs.`);
  }, timeout);

  test('Should connect with known chain "westend" and parachain "westmint".', async () => {
    const detect = new Detector('test-uapp');
    const api = await detect.connect('westend', JSON.stringify(westmint));
    expect(api).toBeTruthy();
    detect.disconnect('westmint');
  }, timeout);
});
