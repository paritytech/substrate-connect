/*
 * @jest-environment jsdom
 */
import { Detector } from './Detector';
import { ApiOptions } from '@polkadot/api/types';
import westend2 from './__mocks__/westend.json';

describe('Initialize Detector without extension', () => {
  let detect: Detector;

  const timeout = 15000;
  const extTimeout = 35000;

  test('Should connect with known chain "westend".', async () => {
    detect = new Detector('test-uapp');
    const api = await detect.connect('westend');
    expect(api).toBeTruthy();
    await detect.disconnect('westend');
  }, timeout);

  test('Should connect with known chain "polkadot".', async () => {
    detect = new Detector('test-uapp');
    const api = await detect.connect('polkadot');
    expect(api).toBeTruthy();
    await detect.disconnect('polkadot');
  }, extTimeout);

  test('Should connect with known chain westend, no chainSpecs and options', async () => {
    const chainName = 'westend';
    detect = new Detector('test-uapp');
    const options = {} as ApiOptions;
    const api = await detect.connect(chainName, undefined, options);
    expect(api).toBeTruthy();
    await detect.disconnect('westend');
  }, extTimeout);

  test('Should connect with known chain "kusama".', async () => {
    detect = new Detector('test-uapp');
    const api = await detect.connect('kusama');
    expect(api).toBeTruthy();
    await detect.disconnect('kusama');
  }, extTimeout);

  test('Should connect with unknown chain westend2 and chainSpecs.', async () => {
    const chainSpec = JSON.stringify(westend2);
    const chainName = 'westend2';
    const detect = new Detector('test-uapp');
    const api = await detect.connect(chainName, chainSpec);
    expect(api).toBeTruthy();
    await detect.disconnect(chainName);
  }, extTimeout);

  test('Should NOT connect with unknown chain westend2 and without chainSpecs.', () => {
    const chainName = 'westend2';
    const detect = new Detector('test-uapp');
    void expect(detect.connect(chainName))
    .rejects
    .toThrow(`No known Chain was detected and no chainSpec was provided. Either give a known chain name ('polkadot', 'kusama', 'westend') or provide valid chainSpecs.`);
  }, timeout);
});
