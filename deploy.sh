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

initDirs() {
  rm -rf ./$directory/*
  mkdir -p ./$directory/burnr
  mkdir -p ./$directory/extension
  touch ./$directory/.nojekyll
}

deployGhPages() {
  echo "Init demo for github pages process..."
  initDirs
  echo "Place burnr wallet demo's files."
  cp -r ./projects/burnr/dist/* ./$directory/burnr/.
  echo "Place Substrate-connect extension's zip."
  cp ./projects/extension/dist/packed-extension.zip ./$directory/extension/packed-extension.zip
  echo "Place landing page's files."
  cp -r ./projects/landing-page/dist/* ./$directory/.
  echo "Generate API docs."
  yarn api-docs
 }

echo -e "\033[0;32mDeleting old content...\033[0m"
rm -rf $directory

echo -e "\033[0;32mChecking out $branch....\033[0m"
git worktree add $directory -f $branch

echo -e "\033[0;32mRebuilding everything...\033[0m"
yarn build

echo -e "\033[0;32mGenerating site...\033[0m"
deployGhPages

echo -e "\033[0;32mDeploying $branch branch...\033[0m"
cd $directory &&
  git add --all &&
  git commit -m "Deploy updates" &&
  git push origin $branch

echo -e "\033[0;32mCleaning up...\033[0m"
git worktree remove -f $directory
