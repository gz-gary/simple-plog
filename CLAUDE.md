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

## 响应式布局分类

不使用传统的"手机/平板/桌面"三分法。按**实际可用空间**决策，用两个维度：宽度断点 + 高度阈值。

### 时间线 (Timeline)

| 视口宽度 | 布局 |
|---|---|
| < 1024px | **左侧时间线** — 竖线靠左（30px），dot 在线上，卡片统一右排 |
| ≥ 1024px | **中心交替时间线** — 竖线居中，卡片左右交替，dot 在中心线上 |

Footer 在所有宽度下均居中（仪式性收束，不随内容对齐）。

Header 在 <1024px 时左对齐（内容区对齐），≥1024px 时居中。

### Lightbox 弹窗 (PlogExpanded)

两个维度交叉判断：

| | 高度 ≥ 500px | 高度 < 500px |
|---|---|---|
| **非全屏** | **标准布局**: 图片 → 控制栏(下) → 文案(下)，垂直居中 | **紧凑布局**: 图片(左) + 控制栏+文案(右)，水平排列 |
| **全屏** | 图片撑满屏幕，仅右上角关闭按钮 | 同左（全屏无视高度阈值） |

紧凑布局的文案面板：随内容增长至 `max-h-[35vh]`，超出部分 `overflow-y-auto` 滚动。

高度检测：`window.visualViewport.height`（兜底 `window.innerHeight`），阈值 500px。监听 `visualViewport.resize` + `window.resize`。

全屏 API 不可用（iOS Safari）时自动隐藏全屏按钮。

### 为什么用 lg(1024px) 而非 md(768px)

手机横屏（iPhone: 844px）会触发 `md:` 但实际只有 ~390px 高度。用 `lg:` 让所有手机（含横屏）走同一套窄屏布局，只有真·宽屏（桌面/平板 ≥1024px）启用 center-split 布局。

## 后续可能加入

- 路由方案（React Router / TanStack Router）
- 图标库（Lucide / Phosphor）
- 字体（Geist / Inter）
- 状态管理（zustand / jotai）
- API 请求（ky / ofetch）
- 组件库（shadcn/ui 仅限于 admin 面板）
