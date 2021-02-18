import { mockSmoldot, respondWith } from '@substrate/smoldot-test-utils';
import { MockPort } from './mocks';
import { ConnectionManager } from './ConnectionManager';

describe('ConnectionManager with one client', () => {

  beforeAll(() => {
  });

  it('changes request and reponse ids on the fly', async () => {
    const client = mockSmoldot(respondWith(['']));
    const manager = new ConnectionManager();
    await manager.addSmoldot('test-network', '', client);
    const port = new MockPort('test-app');

    chrome.runtime.connect(port);
    port.triggerMessage({ type: 'associate', payload: 'test-network' });
    port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }' });

  });

  afterAll(function () {
  });

});
