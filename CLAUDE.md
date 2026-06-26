# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# simple-plog

照片展示网站 — 记录过去一段时间拍的照片，每张附带拍摄地点和想说的话。

## Tech Stack

| 层 | 选型 |
|---|---|
| 构建 | Vite 8 |
| 框架 | React 19 + TypeScript 6 |
| 样式 | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| 图标 | 内联 SVG 组件（`src/components/icons.tsx`），暂无外部图标库 |
| 字体 | Inter（正文）+ Cormorant Garamond（标题/日期/地点）|
| 后端 | 暂无 — 计划纯静态 + 第三方托管 + 第三方 RESTful API |

## Commands

```sh
npm run dev      # 启动开发服务器 (Vite HMR)
npm run build    # tsc -b + vite build (生产构建)
npm run preview  # 预览生产构建
```

- 无测试框架 / lint 配置当前，构建时会通过 `tsc -b` 做类型检查。
- TypeScript `noUnusedLocals` 和 `noUnusedParameters` 已开启，`verbatimModuleSyntax` 要求使用 `import type` 导入类型。

## Project Structure

```
src/
├── main.tsx                  # 入口
├── App.tsx                   # 根组件：header + Timeline + footer + PlogExpanded overlay
├── index.css                 # 全局样式 + Tailwind @theme 自定义色板 + 动画 keyframes
├── types/
│   ├── index.ts              # 类型重导出
│   ├── photo.ts              # Photo, PhotoUrlSet
│   ├── plog.ts               # Plog + 派生函数 getDisplayCities / getDisplayDate
│   └── location.ts           # Location { city, place? }
├── data/
│   └── mock.ts               # 模拟数据（picsum.photos 占位图）
└── components/
    ├── Timeline.tsx           # 垂直时间线容器 + TimelineRow
    ├── PlogCard.tsx           # 时间线上的缩略卡片（照片堆叠效果）
    ├── PlogExpanded.tsx       # 展开大图 overlay（lightbox 风格）
    └── icons.tsx              # 内联 SVG 图标组件
```

## Architecture Patterns

### Two-page strategy (ongoing)
1. **公开画廊** — 当前正在构建。轻量 React，侧重排版、动画、图片展示效果。
2. **Admin 后台** — 计划后续实现，可能会用 shadcn/ui 等组件库。

### Component tree & data flow
```
App (state: expandedId)
 ├─ Timeline (props: plogs, onExpand)
 │   └─ PlogCard (props: plog, onExpand) — collapsed card, clickable
 └─ PlogExpanded (props: plog, onClose) — full overlay, mounted conditionally
```
- 状态集中在 `App`：`expandedId` 控制是否显示 overlay。无全局状态管理。
- `onExpand`/`onClose` 均用 `useCallback` 包裹，避免不必要的重渲染。

### Data model
- `Plog` 是时间线上的一个"事件"，包含多张 `Photo`。
- Plog 本身不存时间和位置字段，而是通过内部所有 photo 的属性**派生**得到：
  - **时间** → 所有 photo 中最早的 `takenAt`（仅取到 YYYY-MM-DD）
  - **地点** → 所有 photo 的 `location.city` 去重集合
- 派生辅助函数在 `src/types/plog.ts` 中作为纯函数导出。

### Image loading pipeline
- 每个 `Photo` 有三档图片 URL：`thumbnail`（卡片用）、`medium`（overlay 默认）、`original`（需手动点击加载）。
- Overlay 中加载 original 时：使用 `fetch` + `ReadableStream` 显示进度条，结果缓存为 blob URL（`Map<photoId, blobUrl>`），支持 `AbortController` 取消。
- 模拟数据使用 picsum.photos（种子参数确保同一 seed 在任何尺寸下返回相同图片）。

### Styling approach
- **Tailwind v4**，通过 `@tailwindcss/vite` 插件集成。
- 自定义色板在 `index.css` 的 `@theme` 块中定义：
  - `page` (#FAFAF8), `ink` (#1A1A1A), `accent` (#C47E4F), `surface` (#F0EFEC), `muted` (#6B6B6B), `line` (#D6D5D1)
- 响应式不使用"手机/平板/桌面"三分法，而是按**实际可用空间**决策。关键 breakpoint 用 `lg` (1024px)。

### Animation
- 动画定义在 `index.css` 的 `@keyframes` 中（overlay-in, frame-in, info-slide-in, error-flash）。
- 全部包裹在 `@media (prefers-reduced-motion: no-preference)` 下，尊重用户减少动效偏好。
- 展开动画使用 `cubic-bezier(0.16, 1, 0.3, 1)` 实现弹性效果。
- Overlay 锁 body 滚动（`document.body.style.overflow = 'hidden'`）。

### Icons
- 内联 SVG 组件在 `icons.tsx`，所有图标统一 `24×24 viewBox`，通过 `className` 控制尺寸。
- 目前有：LocationPin, ChevronLeft/Right, Info, Maximize/Minimize, X (close), Loader (spinner)。
- 没有外部图标库依赖，但文档标注了可选方案（Lucide / Phosphor）。

### Accessibility patterns
- Overlay: `role="dialog"`, `aria-modal="true"`, `aria-label` 含当前照片序号。
- 键盘导航：`ArrowLeft`/`ArrowRight` 切换照片, `Escape` 关闭（先退出全屏再关闭 overlay）。
- 全屏退出时用 `justExitedFullscreen` ref 吞掉一次 Escape 事件，避免误关。
- Touch swipe 横向导航（排除全屏模式）。
- 关闭按钮、导航按钮均有 `aria-label`，focus-visible 用 accent 色 ring 指示。

### Future considerations
- 路由方案（React Router / TanStack Router）
- 状态管理（zustand / jotai）— 当 Timeline 和 overlay 之间需要共享更多状态时引入
- API 请求（ky / ofetch）
- 路径别名 `@/` → `src/`
