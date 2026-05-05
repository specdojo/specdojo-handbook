#!/usr/bin/env bash
set -euo pipefail

sudo mkdir -p \
  /home/node/.claude \
  /home/node/.claude-state \
  /home/node/.codex \
  /home/node/.copilot \
  /home/node/.config/gh

sudo touch /home/node/.claude-state/.claude.json

sudo chown node:node /home/node/.config
sudo chown -R node:node \
  /home/node/.claude \
  /home/node/.claude-state \
  /home/node/.codex \
  /home/node/.copilot \
  /home/node/.config/gh

chmod 700 \
  /home/node/.claude \
  /home/node/.claude-state \
  /home/node/.codex \
  /home/node/.copilot \
  /home/node/.config/gh

chmod 600 /home/node/.claude-state/.claude.json

ln -sf /home/node/.claude-state/.claude.json /home/node/.claude.json
