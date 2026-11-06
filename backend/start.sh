#!/usr/bin/env bash
set -o errexit

daphne core.asgi:application -b 0.0.0.0 -p "$PORT"
