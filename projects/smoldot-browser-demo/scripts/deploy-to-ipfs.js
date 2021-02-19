#!/usr/bin/env node

const path = require('path');
const pinataSDK = require('@pinata/sdk');
const chalk = require('chalk');

const { join } = path;
const PIN_NAME = 'Smoldot Browser Demo';
const folderToUpload = join(__dirname, '..', 'dist');

const log = msg => {
  console.log(`${chalk.green('❇️')} ${msg}`);
};

const warn = msg => {
  console.log(`⚠️ ${chalk.keyword('orange')(msg)}`);
};

const error = msg => {
  console.error(chalk.red(`❌ ${msg}`));
}

async function pinFromDistFolder(pinata) {
  const options = {
    pinataOptions: {
      cidVersion: 1
    },
    pinataMetadata: {
      name: PIN_NAME,
      keyvalues: {
        type: 'smoldot-browser-demo',
        repo: 'https://github.com/paritytech/substrate-connect',
        /* TODO: commit id */
        deployedBy: process.env.USER
      }
    }
  };
  log('Pinning dist folder in ipfs');
  const result = await pinata.pinFromFS(folderToUpload, options);
  const url = `https://${result.IpfsHash}.ipfs.dweb.link/`;

  log(`Pinned ${result.IpfsHash}`);
  log(`Browse to ${url}`);

  return result.IpfsHash;
}

async function unPinOldDeployments(pinata, currentDeploymentHash) {
  log('Unpinning old pinned deployments');
  const result = await pinata.pinList({ status: 'pinned', metadata: { name: PIN_NAME } });

  if (result.count <= 1) {
    // Realistically this should only ever be zero on the first run
    log(`One '${PIN_NAME}' pin found. Not unpinning.`);
    return;
  }

  const oldDeploymentHashes = result
    .rows.filter(r => r.ipfs_pin_hash != currentDeploymentHash)
    .map((r) => r.ipfs_pin_hash);

  if (oldDeploymentHashes.length == 0) {
    warn(`More than one pin with the current deployment hash ${currentDeploymentHash}. `
      + 'Not unpinning. Check the pinata account.');
    return;
  }

  await Promise.all(oldDeploymentHashes.map(
    hash => pinata.unpin(hash)
      .then(() => log(`Unpinned ${hash}`))
      .catch(err => {
        error(`Error unpinning ${hash}`);
        error(`Message from pinata API: ${err.message}`);
      })
    ));
}

function checkEnvironment() {
  let passedChecks = true;

  if (!process.env.npm_config_argv) {
    error('This script should be run by yarn deploy:ipfs');
    passedChecks = false;
  }

  if (!process.env.PINATA_API_KEY) {
    error('This script needs PINATA_API_KEY to be set in your env');
    passedChecks = false;
  }

  if (!process.env.PINATA_API_SECRET) {
    error('This script needs PINATA_API_SECRET to be set in your env');
    passedChecks = false;
  }

  if (!passedChecks) {
    process.exit(1);
  }
}

async function main() {
  checkEnvironment();

  const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);
  const deploymentHash = await pinFromDistFolder(pinata);
  await unPinOldDeployments(pinata, deploymentHash);
}

main().finally(() => process.exit(0));
