# 津彩入画｜杨柳青年画体验工坊

《津彩入画》是一款杨柳青年画互动教学网页。体验包括选画、套印、彩绘和查看成画。本仓库的源码基于 UX01 定版。

## 本地运行

1. 安装 Node.js 20 或更高版本。
2. 将你有权使用的 UX01 定版素材目录 `assets` 放入 `builds/B-TRIO-007-UX01/`。`assets` 内应直接包含 `artworks`、`artwork`、`theme` 和 `seal.svg`。
3. 在仓库根目录运行 `node tools/start.mjs --verify-only` 校验构建，然后运行 `node tools/start.mjs --open` 打开网站。

Windows 也可双击 `启动工作台.cmd`。macOS 可运行 `./启动工作台.command`。

定版素材需要单独取得。本仓库收录网页源码、文化内容与本地启动工具。
