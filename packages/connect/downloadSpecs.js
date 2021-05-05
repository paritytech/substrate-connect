import http from 'https';
import fs from 'fs';

const commonBridgesRepo = 'https://raw.githubusercontent.com/paritytech/smoldot/main/bin';
const customTypesDir = 'src/specs';

const filesConfig = [
  {
    path: `${customTypesDir}/polkadot.json`,
    url: `${commonBridgesRepo}/polkadot.json`
  },
  {
    path: `${customTypesDir}/kusama.json`,
    url: `${commonBridgesRepo}/kusama.json`
  },
  {
    path: `${customTypesDir}/westend.json`,
    url: `${commonBridgesRepo}/westend.json`
  }
  // We can keep that for later use if needed
  // ,
  // {
  //   path: `${customTypesDir}/rococo.json`,
  //   url: `${commonBridgesRepo}/rococo.json`
  // },
  // {
  //   path: `${customTypesDir}/tick.json`,
  //   url: `${commonBridgesRepo}/tick.json`
  // },
  // {
  //   path: `${customTypesDir}/track.json`,
  //   url: `${commonBridgesRepo}/track.json`
  // },
  // {
  //   path: `${customTypesDir}/trick.json`,
  //   url: `${commonBridgesRepo}/trick.json`
  // }
];

filesConfig.map(({ path, url }) => {
  console.log('Start downloading file: ', url);
  const file = fs.createWriteStream(path, { flags: 'w' });
  http.get(url, function (response) {
    response.pipe(file);
  });
});
