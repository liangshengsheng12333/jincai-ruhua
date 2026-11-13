#!/bin/zsh -l
cd -- "${0:A:h}" || exit 1
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
if ! command -v node >/dev/null 2>&1; then
  print '未找到 Node.js。请准备 Node.js 20 或更高版本后，再双击启动。'
  read -r '?按回车关闭窗口。'
  exit 1
fi
node tools/start.mjs --open
result=$?
if (( result != 0 )); then read -r '?按回车关闭窗口。'; fi
exit "$result"
