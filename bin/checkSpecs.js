const fs = require('fs');
const path = require('path');
const networks = [
  'polkadot',
  'kusama',
  'westend'
  //, 'rococo', 'tick', 'track', 'trick'
];

const chainDir = '../../.chains';

const paths = {
  'connect': 'src/specs',
  'extension': 'public/assets'
}

const workspace = path.resolve().split('/').pop();
const workspacePath = `${path.resolve()}/${paths[workspace]}`;
const pathExist = fs.existsSync(workspacePath);

// check if path exist. If not create it
if (!pathExist) fs.mkdirSync(workspacePath);

networks.forEach(network => {
  const file = `${workspacePath}/${network}.json`; 
  if (!fs.existsSync(file)) {
    console.log(`File ${file} does not exist. Copying...`);
    fs.copyFile(
      `${chainDir}/${network}.json`, file,
      (err) => { if (err) throw err }
    );
  }
});
