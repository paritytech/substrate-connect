#!/usr/bin/env bash
# deploy burnr wallet and smoldot browser demo to gh-pages
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
  mkdir -p ./docs/burnr
  mkdir -p ./docs/smoldot-browser-demo
}

landingPage() {
  cp ./README.md ./docs/.
}

deployGhPages() {
  echo "Init demo for github pages process..."
  initDirs
  echo "Place burnr wallet demo's files."
  cp -r ./projects/burnr/dist/* ./docs/burnr/.
  echo "Place Smoldot browser demo's files."
  cp -r ./projects/smoldot-browser-demo/dist/* ./docs/smoldot-browser-demo/.
  echo "Place landing page's files."
  landingPage
 }

deployGhPages
echo "Deployed to github pages"
