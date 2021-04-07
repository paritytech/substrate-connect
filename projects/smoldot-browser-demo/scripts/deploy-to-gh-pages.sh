#!/usr/bin/env bash
#
# Prelude - make bash behave sanely
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
#
set -euo pipefail
IFS=$'\n\t'

REMOTE="${REMOTE:-origin}"
# Should be relative to root of git repo
BUILD_DIR="${BUILD_DIR:-projects/smoldot-browser-demo/dist}"
GH_PAGES_BRANCH="${GH_PAGES_BRANCH:-nik-deploy-ghpages-ipfs}"

RESET='\033[0m'
RED='\033[00;31m'

die() {
  local msg="$*"
  [[ -z "${msg}" ]] || {
    echo "${RED}${msg}${RESET}" 1>&2
  }
  exit 1
}
readonly -f die

main() {
  git diff-index --quiet HEAD || die "You have uncommitted / staged changes"
  git fetch $REMOTE $GH_PAGES_BRANCH 

  yarn build --public-url /substrate-connect

  # Manually create a commit from the contents of the build dir with a message
  # noting the commit id this new gh-pages branch came from
  git add -f dist
  local tree_to_commit=$(git write-tree --prefix=$BUILD_DIR)
  git reset -- dist
  local head_commit_id=$(git describe --dirty --always)
  local new_commit_id=$(git commit-tree -p refs/remotes/$REMOTE/$GH_PAGES_BRANCH \
    -m "Deploy gh-pages from ${head_commit_id}" $tree_to_commit)


  if [ -z ${DRY_RUN+x} ]; then 
    # Put the commit on the head of the gh-pages branch and push it
    git update-ref refs/heads/$GH_PAGES_BRANCH $new_commit_id
    git push --follow-tags $REMOTE refs/heads/$GH_PAGES_BRANCH
    echo "Deployed to gh-pages"
    exit 0
  fi

  echo "DRY_RUN so did not push"; 
}
readonly -f main

main
