#!/usr/bin/env bash
set -euo pipefail

sudo npm install -g @openai/codex

if command -v fdfind >/dev/null 2>&1; then
  sudo ln -sf "$(command -v fdfind)" /usr/local/bin/fd
fi
