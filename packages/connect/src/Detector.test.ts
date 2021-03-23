import { Detector } from './Detector';
import westend from './__mocks__/westend.json';

describe('Initialize Detector without extension', () => {
    test('Should connect.', async () => {
        const chainSpec = JSON.stringify(westend);
        const chainName = 'westend';
        const detect = new Detector(chainName, chainSpec);
        const api = await detect.connect();
        expect(api).toBeTruthy();
    });
});