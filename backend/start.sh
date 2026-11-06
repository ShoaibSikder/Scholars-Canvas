#!/usr/bin/env bash
set -o errexit

echo "Starting Scholars Canvas web service; migrations run during deploy phase."
daphne core.asgi:application -b 0.0.0.0 -p "$PORT"
