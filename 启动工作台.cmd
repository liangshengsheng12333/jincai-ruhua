@echo off
chcp 65001 >nul
pushd "%~dp0" || exit /b 1
where node >nul 2>nul
if errorlevel 1 (
  echo 未找到 Node.js。请准备 Node.js 20 或更高版本后，再双击启动。
  pause
  popd
  exit /b 1
)
node tools/start.mjs --open
set "JINCAI_RESULT=%errorlevel%"
if not "%JINCAI_RESULT%"=="0" pause
popd
exit /b %JINCAI_RESULT%
