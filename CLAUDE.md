# simple-plog

照片展示网站 — 记录过去一段时间拍的照片，每张附带拍摄地点和想说的话。

## Tech Stack

| 层 | 选型 |
|---|---|
| 构建 | Vite 8 |
| 框架 | React 19 + TypeScript 6 |
| 样式 | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| 图标 | _(待定)_ |
| 字体 | _(待定)_ |
| 后端 | _(暂无 — 计划纯静态 + 第三方托管 + 第三方 RESTful API)_ |

## 架构思路

**两套页面，两套技术方案：**

1. **公开画廊** — 展示型、非功能性页面。纯 HTML/CSS/JS 或尽可能轻量的 React，侧重精确控制排版、动画、图片加载效果。
2. **Admin 后台** — 功能性页面。后续可能会用 shadcn/ui 等组件库提升开发效率。

## 项目配置

- 路径别名：暂未配置（后续需要时可加 `@/` → `src/`）
- 构建命令：`npm run dev` / `npm run build` / `npm run preview`

## 后续可能加入

- 路由方案（React Router / TanStack Router）
- 图标库（Lucide / Phosphor）
- 字体（Geist / Inter）
- 状态管理（zustand / jotai）
- API 请求（ky / ofetch）
- 组件库（shadcn/ui 仅限于 admin 面板）
