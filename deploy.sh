#!/usr/bin/env bash
set -euxo pipefail

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

echo -e "Deleting old content..."
rm -rf $directory

echo -e "Checking out $branch...."
git worktree add $directory -f $branch

echo -e "Rebuilding everything..."
yarn build

echo -e "Generating site..."
echo "Init demo for github pages process..."
rm -rf ./$directory/*
mkdir -p ./$directory/burnr
mkdir -p ./$directory/demo
mkdir -p ./$directory/extension
touch ./$directory/.nojekyll
echo "Place burnr wallet demo's files."
cp -r ./projects/burnr/dist/* ./$directory/burnr/.
echo "Place multi-demo's files."
cp -r ./projects/demo/dist/* ./$directory/demo/.
echo "Place Substrate-connect extension's zip."
cp ./projects/extension/dist/packed-extension.zip ./$directory/extension/packed-extension.zip
echo "Generate API docs."
yarn api-docs

echo -e "Deploying $branch branch..."
cd $directory &&
  git add --all &&
  GIT_COMMITTER_NAME='Docs builder' GIT_COMMITTER_EMAIL='info@parity.io' git commit --author "Docs builder <info@parity.io>" -m "Deploy updates" &&
  git push origin $branch

echo -e "Cleaning up..."
git worktree remove -f $directory
