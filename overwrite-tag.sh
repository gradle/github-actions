#!/bin/zsh
TAG_NAME=$1

git tag -fa -m "${TAG_NAME}" "${TAG_NAME}"
git push origin :refs/tags/${TAG_NAME}
git push --follow-tags -f