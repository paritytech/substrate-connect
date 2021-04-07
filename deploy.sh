#!/usr/bin/env bash
# deploy all projects and landing page to gh-pages and ipfs
rm -rf ./docs
mkdir ./docs

yarn run build

mkdir ./docs/burnr
cp -r ./projects/burnr/dist/* ./docs/burnr
sed 's/href="/href="https:\/\/paritytech.github.io\/substrate-connect\/burnr/g' ./docs/burnr/index.html > ./docs/burnr/tmp
sed 's/src="/src="https:\/\/paritytech.github.io\/substrate-connect\/burnr/g' ./docs/burnr/tmp > ./docs/burnr/tmp2
mv ./docs/burnr/tmp2 ./docs/burnr/index.html
rm -rf ./docs/burnr/tmp*

mkdir ./docs/smoldot-browser-demo
cp -r ./projects/smoldot-browser-demo/dist/* ./docs/smoldot-browser-demo
sed 's/href="/href="https:\/\/paritytech.github.io\/substrate-connect\/smoldot-browser-demo/g' ./docs/smoldot-browser-demo/index.html > ./docs/smoldot-browser-demo/tmp
sed 's/src="/src="https:\/\/paritytech.github.io\/substrate-connect\/smoldot-browser-demo/g' ./docs/smoldot-browser-demo/tmp > ./docs/smoldot-browser-demo/tmp2
mv ./docs/smoldot-browser-demo/tmp2 ./docs/smoldot-browser-demo/index.html
rm -rf ./docs/smoldot-browser-demo/tmp*

cp ./README.md ./docs/.
