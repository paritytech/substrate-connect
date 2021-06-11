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
const arguments = process.argv.slice(2);
const action = arguments[0];
let which;

// stop script if action argument does not exist
if (!action || (action !== 'test' && action !== 'build')) {
  console.log(`A 'test' or a 'build' action must be provided. Exiting.`)
  return;
}

which = arguments[1];

// this means that argument action ("build" or "test") was provided
if (action === 'build') {
  // during build we need only 'extension' - so if connect is given as argument script should exit
  if (which && which === 'connect') {
    console.log('Connect does not need specs during build. Please read the README.md file');
    return;
  }

  if (which && which.length === 1) {
    if (!Object.keys(projectsDirs).includes(which)) {
      console.log('Provided argument is unknown. Exiting.');
      return;
    }
    execute(which);
  } else if (!which) {
    execute(['extension']);
  } else {
    console.log('Error with arguments provided. Please read the README.md file.');
  }
} else if (action === 'test') {
  if (which && which.length === 1) {
    if (!Object.keys(projectsDirs).includes(which)) {
      console.log('Provided argument is unknown. Exiting.');
      return;
    }
    execute(which);
  } else if (!which) {
    execute(Object.keys(projectsDirs));
  } else {
    console.log('Error with arguments provided. Please read the README.md file.');
  }
}
