#!/usr/bin/env bash
# deploy all projects and landing page to gh-pages and ipfs
set -euo pipefail

die() {
  local msg="$*"
  [[ -z "${msg}" ]] || {
    echo "${RED}${msg}${RESET}" 1>&2
  }
  exit 1
}
readonly -f die

initDirs() {
  rm -rf ./docs/*
  mkdir ./docs/burnr
  mkdir ./docs/smoldot-browser-demo
}

burnr() {
  cp -r ./projects/burnr/dist/* ./docs/burnr
  # sed "s/href='/href='https:\/\/${company}.github.io\/${name}\/burnr/g" ./docs/burnr/index.html > ./docs/burnr/tmp
  # sed "s/href='/href='https:\/\/${company}.github.io\/${name}\/burnr/g" ./docs/burnr/tmp > ./docs/burnr/tmp2
  sed 's/href="/href="./g' ./docs/burnr/index.html > ./docs/burnr/tmp
  sed 's/src="/src="./g' ./docs/burnr/tmp > ./docs/burnr/tmp2
  mv ./docs/burnr/tmp2 ./docs/burnr/index.html
}

smoldotBrowserDemo() {
  cp -r ./projects/smoldot-browser-demo/dist/* ./docs/smoldot-browser-demo
  sed 's/href="/href="./g' ./docs/smoldot-browser-demo/index.html > ./docs/smoldot-browser-demo/tmp
  sed 's/src="/src="./g' ./docs/smoldot-browser-demo/tmp > ./docs/smoldot-browser-demo/tmp2
  mv ./docs/smoldot-browser-demo/tmp2 ./docs/smoldot-browser-demo/index.html
}

landingPage() {
  cp ./README.md ./docs/.
}

cleanup() {
  rm -rf ./docs/burnr/tmp*
  rm -rf ./docs/smoldot-browser-demo/tmp*
}

main() {
  echo "Init demo gh-pages process..."
  initDirs
  echo "Create burnr wallet demo."
  burnr
  echo "Create Smoldot browser demo."
  smoldotBrowserDemo
  echo "Create landing page"
  landingPage
  echo "Cleanup directories"
  cleanup
  echo "Deployed to gh-pages"
  exit 0
}

main
