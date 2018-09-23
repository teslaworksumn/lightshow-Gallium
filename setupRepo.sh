#!/bin/bash -eu
REPO_ROOT=$(cd "`dirname "$0"`" && pwd)
PARENT_DIR=$(cd "$REPO_ROOT/.." && pwd)

rm "-rf" "${REPO_ROOT}/build"
rm "-rf" "${REPO_ROOT}/app/shows"

mkdir "${REPO_ROOT}/build"
mkdir "${REPO_ROOT}/app/shows"
