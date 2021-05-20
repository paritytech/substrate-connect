import http from 'https';
import fs from 'fs';

const commonRepo = 'https://raw.githubusercontent.com/paritytech/smoldot/main/bin';
const customTypesDir = 'public/assets';

const filesConfig = [
  {
    path: `${customTypesDir}/polkadot.json`,
    url: `${commonRepo}/polkadot.json`
  },
  {
    path: `${customTypesDir}/kusama.json`,
    url: `${commonRepo}/kusama.json`
  },
  {
    path: `${customTypesDir}/westend.json`,
    url: `${commonRepo}/westend.json`
  }
  // We can keep that for later use if needed
  // ,
  // {
  //   path: `${customTypesDir}/rococo.json`,
  //   url: `${commonRepo}/rococo.json`
  // },
  // {
  //   path: `${customTypesDir}/tick.json`,
  //   url: `${commonRepo}/tick.json`
  // },
  // {
  //   path: `${customTypesDir}/track.json`,
  //   url: `${commonRepo}/track.json`
  // },
  // {
  //   path: `${customTypesDir}/trick.json`,
  //   url: `${commonRepo}/trick.json`
  // }
];

filesConfig.map(({ path, url }) => {
  console.log('Start downloading file: ', url, path);
  const file = fs.createWriteStream(path, { flags: 'w' });
  http.get(url, function (response) {
    response.pipe(file);
  });
});
