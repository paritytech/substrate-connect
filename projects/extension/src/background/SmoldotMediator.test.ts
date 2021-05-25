/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { jest } from '@jest/globals';
import * as smoldot from 'smoldot';
import { SmoldotMediator } from './SmoldotMediator';
import { JsonRpcRequest, JsonRpcResponse } from 'types';
import westend from '../../public/assets/westend.json';
import { AppMediator } from './AppMediator';
import { MockPort, MockConnectionManager } from '../mocks';

describe('SmoldotMediator unit tests', () => {
  let sc: smoldot.SmoldotClient;
  let sm: SmoldotMediator;
  let appMed: AppMediator;

  let spyScSendJsonRpc: unknown;
  let spyScTerminate: unknown;
  beforeAll(async () => {
    // init smoldot and SmoldotMediator
    sc = await (smoldot as any).start({
      chainSpecs: [JSON.stringify(westend)],
      maxLogLevel: 3,
      jsonRpcCallback: (message: string) => {
        const parsed = JSON.parse(message) as JsonRpcResponse;
        for (const app of sm.apps) {
          if (app.processSmoldotMessage(parsed)) {
            break;
          }
        }
      }
    });
    sm = new SmoldotMediator('westend', sc);
    spyScSendJsonRpc = jest.spyOn(sc, 'sendJsonRpc');
    spyScTerminate = jest.spyOn(sc, 'terminate');
  });

  afterAll(() => {
    sm.shutdown();
  });

  test('Test addApp', () => {
    const port = new MockPort('test-app::westend');
    const manager = new MockConnectionManager(true);
    appMed = new AppMediator(port, manager);
    sm.addApp(appMed);
    expect(sm.apps).toHaveLength(1);
  });

  test('Test removeApp', () => {
    sm.removeApp(appMed);
    expect(sm.apps).toHaveLength(0);
  });

  test('Test sendRpc', () => {
    const message: JsonRpcRequest = {
      id: 1,
      jsonrpc: '2.0',
      method: 'something',
      params: []
    };
    const stringified = JSON.stringify(message);
    sm.sendRpcMessage(message);
    expect(spyScSendJsonRpc).toHaveBeenCalledTimes(1);
    expect(spyScSendJsonRpc).toHaveBeenCalledWith(stringified, 0);
  });

  test('Test shutdown', () => {
    sm.shutdown();
    expect(spyScTerminate).toHaveBeenCalledTimes(1);
  });
});
