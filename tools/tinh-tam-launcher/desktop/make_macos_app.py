#!/usr/bin/env python3
"""Build a Finder-clickable macOS .app wrapper for the existing Tinh Tam Launcher."""
from __future__ import annotations
import argparse
import os
import plistlib
from pathlib import Path
import stat

APP_NAME = 'TINH TAM ONLINE.app'
LAUNCH = r'''#!/bin/bash
# Clickable Finder launcher. Start the existing web UI, do not replace it.
set -u
GAME_ROOT="$(cd "$(dirname "$0")/../../.." && pwd -P)"
LAUNCHER="$GAME_ROOT/tools/tinh-tam-launcher/launcher.cjs"
URL='http://127.0.0.1:3388/'
DATA="$HOME/.tinh-tam-launcher"
mkdir -p "$DATA"
log="$DATA/desktop-opener.log"

alert() {
  /usr/bin/osascript -e 'on run argv' -e 'display dialog (item 1 of argv) with title "TĨNH TÂM ONLINE" buttons {"OK"} default button "OK"' -e 'end run' "$1" >/dev/null 2>&1 || true
}

if [[ ! -f "$LAUNCHER" || ! -f "$GAME_ROOT/package.json" ]]; then
  alert 'Không tìm thấy Launcher trong thư mục game. Hãy giữ ứng dụng .app ngay trong thư mục gốc game-chua-moi.'
  exit 1
fi
# Finder does not source ~/.zshrc / ~/.bashrc, so nvm-installed Node is often missing from PATH.
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.local/share/mise/shims:$HOME/.asdf/shims:$PATH"
node_path="$(command -v node || true)"
if [[ -z "$node_path" && -d "$HOME/.nvm/versions/node" ]]; then
  # Glob then sort with version sort if available; latest modification is a reasonable fallback.
  while IFS= read -r candidate; do
    if [[ -x "$candidate" ]]; then node_path="$candidate"; break; fi
  done < <(/bin/ls -1dt "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null || true)
fi
if [[ -z "$node_path" ]]; then
  alert 'Máy chưa tìm thấy Node.js. Cài Node.js rồi mở lại ứng dụng TĨNH TÂM ONLINE.'
  exit 2
fi
export PATH="$(dirname "$node_path"):$PATH"
# Distinguish our app from another server already listening on this port.
is_ours() {
  /usr/bin/curl -fsS --max-time 2 "$URL" 2>/dev/null | /usr/bin/grep -q 'TĨNH TÂM ONLINE.*Launcher'
}
if is_ours; then
  /usr/bin/open "$URL"
  exit 0
fi
if /usr/bin/lsof -nP -iTCP:3388 -sTCP:LISTEN >/dev/null 2>&1; then
  alert 'Cổng 3388 đang được chương trình khác sử dụng. Không thể mở Launcher.'
  exit 3
fi
# Background process remains running when .app is closed. No Terminal window.
cd "$GAME_ROOT" || exit 4
/usr/bin/nohup "$node_path" "$LAUNCHER" --game "$GAME_ROOT" --no-open >> "$log" 2>&1 < /dev/null &
child=$!
for _ in $(/usr/bin/seq 1 40); do
  if is_ours; then
    /usr/bin/open "$URL"
    exit 0
  fi
  if ! /bin/kill -0 "$child" >/dev/null 2>&1; then
    break
  fi
  /bin/sleep 0.25
done
alert 'Không mở được Launcher. Xem log tại ~/.tinh-tam-launcher/desktop-opener.log'
exit 5
'''

def build(game: Path) -> Path:
    game = game.resolve()
    launcher = game/'tools/tinh-tam-launcher/launcher.cjs'
    if not launcher.is_file() or not (game/'tools/tinh-tam-launcher/interface.html').is_file():
        raise RuntimeError('Chưa cài TĨNH TÂM Launcher; thiếu tools/tinh-tam-launcher/launcher.cjs hoặc interface.html')
    if not (game/'package.json').is_file():
        raise RuntimeError('Không tìm thấy package.json trong thư mục game')
    app = game/APP_NAME
    contents = app/'Contents'
    macos = contents/'MacOS'
    macos.mkdir(parents=True, exist_ok=True)
    info = {
       'CFBundleName':'TĨNH TÂM ONLINE',
       'CFBundleDisplayName':'TĨNH TÂM ONLINE',
       'CFBundleExecutable':'start',
       'CFBundleIdentifier':'vn.tinhtam.online.launcher',
       'CFBundlePackageType':'APPL',
       'CFBundleShortVersionString':'1.1',
       'CFBundleVersion':'1',
       'LSMinimumSystemVersion':'11.0',
       'LSUIElement': True,
       'NSHighResolutionCapable': True,
    }
    with (contents/'Info.plist').open('wb') as f:
       plistlib.dump(info, f)
    executable = macos/'start'
    executable.write_text(LAUNCH, encoding='utf-8')
    executable.chmod(executable.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    return app

if __name__=='__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--project',required=True)
    a=p.parse_args()
    print('SUCCESS:',build(Path(a.project)))
    print('Nhấp đúp ứng dụng này trong Finder để mở Launcher, không cần Terminal.')
