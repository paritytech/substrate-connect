const http = require('https');
const fs = require('fs');

const specsRepo = 'https://raw.githubusercontent.com/paritytech/smoldot/main/bin';
const chainDir = '.chains';

const networks = [
  'polkadot', 'kusama', 'westend' // , 'rococo', 'tick', 'track', 'trick'
];

const paths = [
  'packages/connect/assets',
  'projects/extension/public/assets',
]

console.log(`Init downloading of specs for chains ${networks.join(', ')}.`);
let promise = new Promise((resolve) => {
  networks.forEach((network, index, array) => {
    let url = `${specsRepo}/${network}.json`;
    http.get(url, function (response) {
      console.log(`Downloading '${network}.json' in '${chainDir}' dir`);
      let path = `${chainDir}/${network}.json`;
      response.pipe(fs.createWriteStream(path, { flags: 'w' }));
      if (index === array.length -1) resolve();
    });
  });
});
void promise.then(() => {
  paths.forEach(path => {
    networks.forEach(network => {
      fs.copyFile(`${chainDir}/${network}.json`, `${path}/${network}.json`, function (err) {
        if (err) throw err
      });
    console.log(`Successfully moved '${chainDir}/${network}.json' to '${path}'`);
    });
  });
});
