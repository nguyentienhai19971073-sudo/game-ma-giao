#!/bin/bash
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Chua cai Node.js. Hay cai Node.js truoc."
  read -r -p "Nhan Enter de dong..." _
  exit 1
fi
node "tools/tinh-tam-launcher/launcher.cjs" --game "$(pwd)"
