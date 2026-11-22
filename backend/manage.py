#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
from pathlib import Path
import subprocess
import sys


def main():
    """Run administrative tasks."""
    # A fresh Windows terminal may resolve python to a global Django install.
    if os.name == "nt" and sys.prefix == sys.base_prefix:
        local_python = Path(__file__).resolve().parent / "venv" / "Scripts" / "python.exe"
        if local_python.is_file():
            try:
                result = subprocess.run([str(local_python), *sys.argv])
            except KeyboardInterrupt:
                raise SystemExit(130) from None
            raise SystemExit(result.returncode)

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
