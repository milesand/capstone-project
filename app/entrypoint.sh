#!/usr/bin/env sh
set -eo pipefail

if [ -z "${USER_ID}" ]; then
    echo "$$USER_ID not set"
    return 1
fi

if [ -z "${GROUP_ID}" ]; then
    echo "$$GROUP_ID not set"
    return 1
fi

chown --recursive "${USER_ID}:${GROUP_ID}" \
    /wait-for-it.sh \
    /app \
    /socket \
    /file

su-exec "${USER_ID}:${GROUP_ID}" "$@"