#!/usr/bin/env bash
# deploy all projects and landing page to gh-pages and ipfs
rm -rf ./docs
mkdir ./docs

# yarn run build

mkdir ./docs/burnr
cp -r ./projects/burnr/dist/* ./docs/burnr

mkdir ./docs/smoldot-browser-demo
cp -r ./projects/smoldot-browser-demo/dist/* ./docs/smoldot-browser-demo

cp ./README.md ./docs/.
