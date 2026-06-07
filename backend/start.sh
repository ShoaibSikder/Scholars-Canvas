#!/usr/bin/env bash
set -o errexit

python manage.py migrate --no-input
daphne core.asgi:application -b 0.0.0.0 -p "$PORT"
