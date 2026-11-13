# 🎨 津彩入画｜杨柳青年画体验工坊 (Jincai Ruhua)

<p align="center">
  <b>非物质文化遗产数字传承 · 杨柳青年画交互体验与数字化教学平台</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Heritage-Yangliuqing%20New%20Year%20Paintings-E53935.svg?style=flat-square" alt="Heritage" />
  <img src="https://img.shields.io/badge/Frontend-HTML5%20%7C%20Canvas%20%7C%20JS-F7DF1E.svg?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Environment-Node.js%2020%2B-339933.svg?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
</p>

---

## 📖 项目简介

**《津彩入画》** 是一款致力于国家级非物质文化遗产——**天津杨柳青木版年画**数字化保护与交互式教学的轻量级 Web 互动工坊。用户可在沉浸式的数字画坊中，亲身体验中国传统木版年画独特的四步核心工艺流程：

1. **选画（Selection）**：精选传世经典年画线稿与民俗题材；
2. **套印（Woodblock Printing）**：模拟木版对位与墨线按压，还原传统刷印工序；
3. **彩绘（Hand Painting）**：体验杨柳青年画“半印半画”精髓，自主调色晕染；
4. **钤印成画（Sealing & Finishing）**：盖上专属朱红名印，导出数字典藏成画。

---

## 🛠️ 本地运行指南

### 环境要求
- **Node.js**：v20.0 或更高版本

### 快速启动
1. 将定版素材目录 `assets` 放入 `builds/B-TRIO-007-UX01/`（包含 `artworks`、`artwork`、`theme` 与 `seal.svg`）；
2. 执行构建校验与启动：
   `ash
   # 校验构建资产
   node tools/start.mjs --verify-only

   # 启动并在默认浏览器中打开
   node tools/start.mjs --open
   `
3. **一键运行脚本**：
   - Windows：双击运行根目录下 `启动工作台.cmd`
   - macOS / Linux：在终端执行 `./启动工作台.command`

---

## 📜 许可证

本仓库原创源码和工程文档均遵循 [MIT License](LICENSE) 开源协议。原画稿及随附非遗素材按其各自授权规范使用。