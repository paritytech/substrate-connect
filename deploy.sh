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

directory=_site
branch=gh-pages
build_command() {
  jekyll build
}

initDirs() {
  rm -rf ./$directory/*
  mkdir -p ./$directory/burnr
  mkdir -p ./$directory/smoldot-browser-demo
  mkdir -p ./$directory/multiple-network-demo
  mkdir -p ./$directory/extension
}

deployGhPages() {
  echo "Init demo for github pages process..."
  initDirs
  echo "Place burnr wallet demo's files."
  cp -r ./projects/burnr/dist/* ./$directory/burnr/.
  echo "Place Smoldot browser demo's files."
  cp -r ./projects/smoldot-browser-demo/dist/* ./$directory/smoldot-browser-demo/.
  echo "Place Multiple network demo's files."
  cp -r ./projects/multiple-network-demo/dist/* ./$directory/multiple-network-demo/.
  echo "Place Substrate-connect extension's zip."
  cp ./projects/extension/dist/substrate-connect.zip ./$directory/extension/substrate-connect.zip
  echo "Place landing page's files."
  cp -r ./projects/landing-page/dist/* ./$directory/.
 }

echo -e "\033[0;32mDeleting old content...\033[0m"
rm -rf $directory

echo -e "\033[0;32mChecking out $branch....\033[0m"
git worktree add $directory -f $branch

echo -e "\033[0;32mGenerating site...\033[0m"
deployGhPages #build_command

echo -e "\033[0;32mDeploying $branch branch...\033[0m"
cd $directory &&
  git add --all &&
  git commit -m "Deploy updates" &&
  git push origin $branch

echo -e "\033[0;32mCleaning up...\033[0m"
git worktree remove -f $directory
