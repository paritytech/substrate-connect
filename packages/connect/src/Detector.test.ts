import { Detector } from './Detector';
import westend from './__mocks__/westend.json';

describe('Initialize Detector without extension', () => {
    let detect: Detector;

    test('Should connect.', async done => {
        try {
            const chainSpec = JSON.stringify(westend);
            const chainName = 'westend';
            detect = new Detector(chainName, chainSpec);
            const api = await detect.connect();
            expect(api).toBeTruthy();
            done();
        } catch (err: unknown) {
            done(err);
        } finally {
            await detect.disconnect();
        }
    }, 30000);
});