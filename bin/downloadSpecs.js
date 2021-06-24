const http = require('https');
const fs = require('fs');

const specsRepo = 'https://raw.githubusercontent.com/paritytech/smoldot/main/bin';
const chainDir = '.chains';

const networks = [
  'polkadot',
  'kusama',
  'westend'
  //, 'rococo', 'tick', 'track', 'trick'
];

const paths = [
  'packages/connect/src/specs',
  'projects/extension/public/assets',
]

// check if paths exist. If not create them
paths.forEach(p => {
  (!fs.existsSync(p)) && fs.mkdirSync(p);  
});

// Initialiaze download of specs from smoldot (for now)
// and create promises to be executed
let promises = [];
console.log(`Init downloading of specs for chains ${networks.join(', ')}.`);
networks.forEach((network) => {
  let url = `${specsRepo}/${network}.json`;
  let promise = new Promise((resolve, reject) => {
      http.get(url, function (response) {
      console.log(`Downloading '${network}.json' in '${chainDir}' dir`);
      let path = `${chainDir}/${network}.json`;
      const stream = response.pipe(fs.createWriteStream(path, { flags: 'w' }));
      stream.on('finished', () => resolve());
      stream.on('error', () => reject());
    });
  });
  promises.push(promise);
});

//Execute downloading of files and copy files to specific directoies
Promise.all(promises).then(() => {
  paths.forEach(path => {
    networks.forEach(network => {
      fs.copyFile(
        `${chainDir}/${network}.json`, `${path}/${network}.json`,
        (err) => { if (err) throw err }
      );
      console.log(`Successfully moved '${chainDir}/${network}.json' to '${path}'`);
    });
  });
}).catch(err => console.log('Error:', err));
