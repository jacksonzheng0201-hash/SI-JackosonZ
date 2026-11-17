#!/bin/sh
set -eu
project="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if command -v node >/dev/null 2>&1; then
  runtime="$(command -v node)"
elif [ -x "$HOME/Applications/Qoder.app/Contents/MacOS/Qoder" ]; then
  runtime="$HOME/Applications/Qoder.app/Contents/MacOS/Qoder"
  export ELECTRON_RUN_AS_NODE=1
elif [ -x "/Applications/Qoder.app/Contents/MacOS/Qoder" ]; then
  runtime="/Applications/Qoder.app/Contents/MacOS/Qoder"
  export ELECTRON_RUN_AS_NODE=1
else
  printf '%s\n' 'Please ask an adult to help install Node.js 22 or newer.'
  exit 1
fi
# Node rejects backslashes in module URLs, so use a temporary, symlink-preserving path.
runtime_dir="$(mktemp -d /tmp/de-pollution.XXXXXX)"
ln -s "$project" "$runtime_dir/project"
trap 'rm -f "$runtime_dir/project"; rmdir "$runtime_dir"' EXIT
if [ "${1:-}" = "--test" ]; then
  "$runtime" --preserve-symlinks --preserve-symlinks-main --test "$runtime_dir"/project/tests/*.test.mjs
else
  "$runtime" --preserve-symlinks --preserve-symlinks-main "$runtime_dir/project/server.mjs"
fi
