import { Detector } from './Detector';
import { ApiOptions } from '@polkadot/api/types';
import westend2 from './__mocks__/westend.json';

describe('Initialize Detector without extension', () => {
  let detect: Detector;

  test('Should connect with known chain "westend".', async done => {
    try {
      detect = new Detector('test-uapp');
      const api = await detect.connect('westend');
      expect(api).toBeTruthy();
      done();
    } catch (err: unknown) {
      done(err);
    } finally {
      await detect.disconnect('westend');
    }
  }, 15000);

  test('Should connect with known chain "polkadot".', async done => {
    try {
      detect = new Detector('test-uapp');
      const api = await detect.connect('polkadot');
      expect(api).toBeTruthy();
      done();
    } catch (err: unknown) {
      done(err);
    } finally {
      await detect.disconnect('polkadot');
    }
  }, 15000);

  // DEACTIVATED for now due to chainSpecs - once Kusama specs are available this should be activated
  test.skip('Should connect with known chain "kusama".', async done => {
    try {
      detect = new Detector('test-uapp');
      const api = await detect.connect('kusama');
      expect(api).toBeTruthy();
      done();
    } catch (err: unknown) {
      done(err);
    } finally {
      await detect.disconnect('kusama');
    }
  }, 15000);

  test('Should connect with unknown chain westend2 and chainSpecs.', async done => {
    try {
      const chainSpec = JSON.stringify(westend2);
      const chainName = 'westend2';
      detect = new Detector('test-uapp');
      const api = await detect.connect(chainName, chainSpec);
      expect(api).toBeTruthy();
      done();
    } catch (err: unknown) {
      done(err);
    } finally {
      await detect.disconnect('westend2');
    }
  }, 15000);

  test('Should connect with unknown chain westend2, chainSpecs and options', async done => {
    try {
      const chainSpec = JSON.stringify(westend2);
      const chainName = 'westend2';
      detect = new Detector('test-uapp');
      const options = {} as ApiOptions;
      const api = await detect.connect(chainName, chainSpec, options);
      expect(api).toBeTruthy();
      done();
    } catch (err: unknown) {
      done(err);
    } finally {
      await detect.disconnect('westend2');
    }
  }, 15000);

  test('Should connect with known chain westend, no chainSpecs and options', async done => {
    try {
      const chainName = 'westend';
      detect = new Detector('test-uapp');
      const options = {} as ApiOptions;
      const api = await detect.connect(chainName, undefined, options);
      expect(api).toBeTruthy();
      done();
    } catch (err: unknown) {
      done(err);
    } finally {
      await detect.disconnect('westend');
    }
  }, 15000);

  test('Should NOT connect with unknown chain westend2 and without chainSpecs.', done => {
    const chainName = 'westend2';
    detect = new Detector('test-uapp');
    void expect(detect.connect(chainName))
    .rejects
    .toThrow(`No known Chain was detected and no chainSpec was provided. Either give a known chain name ('polkadot', 'kusama', 'westend') or provide valid chainSpecs.`);
    done();
  }, 15000);

});
