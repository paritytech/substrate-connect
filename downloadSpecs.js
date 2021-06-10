const http = require('https');
const fs = require('fs');

const specsRepo = 'https://raw.githubusercontent.com/paritytech/smoldot/main/bin';
const projectsDirs = {
  'connect': 'packages/connect/src/specs',
  'extension': 'projects/extension/public/assets'
}

 // We can keep that the commented our for later use if needed
const networks = [
  'polkadot', 'kusama', 'westend' // , 'rococo', 'tick', 'track', 'trick'
]

function execute(keys) {
  const files = new Array(networks.length);
  console.log(`Init downloading of specs for chains ${networks.join(', ')}.`);
  networks.forEach(network => {
    let url = `${specsRepo}/${network}.json`;
    http.get(url, function (response) {
      console.log(`\nSaving '${network}.json'`);
      keys.forEach(key => {
        let path = `${projectsDirs[key]}/${network}.json`;
        response.pipe(fs.createWriteStream(path, { flags: 'w' }));
        console.log(`at project's '${key}' directory : ${projectsDirs[key]}.`);
      });
    });
  });
}

// remove 2 first inputs of process.argv which are 'node' command and this file's name
const argument = process.argv.slice(2);

// this means that argument was provided - we expect only one which should
// be the project/package's name
if (argument && argument.length === 1) {
  if (Object.keys(projectsDirs).includes(argument[0])) {
    execute(argument);
  } else {
    console.log('Provided argument is unknown.');
  }
} else if (!argument.length) {
  execute(Object.keys(projectsDirs));
} else {
  console.log('Error with arguments provided. Please read the README.md file.');
}
