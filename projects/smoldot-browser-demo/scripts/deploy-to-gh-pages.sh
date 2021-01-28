#!/usr/bin/env bash
#
# Prelude - make bash behave sanely
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
#
set -euo pipefail
IFS=$'\n\t'

BUILD_DIR="dist"
GH_PAGES_BRANCH="gh-pages"

die() {
  local msg="$*"
  [[ -z "${msg}" ]] || {
    tput setaf 1  # red
    tput bold
    echo "${msg}" 1>&2
    tput sgr0     # reset
  }
  exit 1
}
readonly -f die

main() {
  git diff-index --quiet HEAD || die "You have uncommitted / staged changes"
  git fetch origin $GH_PAGES_BRANCH 
  git add -f $BUILD_DIR
  local tree_to_commit=$(git write-tree --prefix=$BUILD_DIR)
  git reset -- $BUILD_DIR
  local head_commit_id=$(git describe HEAD)
  commit=$(git commit-tree -p refs/remotes/origin/$GH_PAGES_BRANCH -m "Deploy gh-pages from ${head_commit_id}" $tree)
  git update-ref refs/heads/$GH_PAGES_BRANCH $commit
  git push --follow-tags origin refs/heads/$GH_PAGES_BRANCH
}
readonly -f main

main
