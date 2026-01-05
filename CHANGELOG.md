# Changelog

## [1.2.0] - 2026-01-06

### ✨ 新功能
- **核心功能升级** 
    - **Intl 支持**：`value`传数字时，支持`numberFormat`属性，配合`Intl.NumberFormat`使用, 支持国际化格式化。
    - **`autoScale`** 自动大小缩放适配容器，注意需要父控件给定宽高。
    - **A11y & Reduced Motion**: Automatically respects system `prefers-reduced-motion` preferences (can be overridden via `disableAnimation`).
    - **`fadingEdge`** 上下边缘模糊效果。
    - **`disableAnimation`** 禁用动画。
    - **缓动函数增强**：增加了更多的内置缓动选项（如 easeOutBack），并优化了自定义 Easing 函数的类型支持。
    - **前后缀完善**: 完善了 prefix 和 suffix 属性，确保静态文本不参与列滚动逻辑，且在布局切换时保持稳定。
    - **无障碍优化 (A11y)**: ARIA + Screen Reader 支持。自动检测系统 `prefers-reduced-motion` 设置，尊重用户减弱动画的偏好（也可手动通过 `disableAnimation` 强制禁用）。
- **Vue 组件同步**
    - **属性对齐**：为 Vue 版本同步增加了 prefix、suffix、autoScale、fadingEdge 和 numberFormat等 Props。
    - **回调事件**：增加了 @animation-end 事件分发。
    - **Intl 支持**：优化了 :number-format 属性的响应式逻辑，使其能配合国际化格式实时更新。

- **官网改造升级** — UI调整，Demo增加更多控制选项，支持 React/Vue 代码实时预览，100% 适配中英双语切换，集成 StackBlitz 一键导出在线运行。
- **预设字符集 (Presets)替换TickerUtils** — 提供 `NUMBER`, `ALPHABET`, `CURRENCY`, `ALPHANUMERIC` 等常用字符集常量。


### ⚡ 性能与优化
- **同步初始化 (Zero Latency)** — Ticker 组件现在会在挂载瞬间同步计算首屏列状态，彻底解决刷新网页时的“白屏闪烁”问题。
- **连贯滚动增强** — 优化了挂载瞬间的值变更逻辑，确保即使在极速数据更新下，动画也能从初始值平滑过渡。
- **更新数据流** — 优化 Demo 数据更新循环，实现挂载即更新，无需额外等待初始间隔。

### 📝 文档
- 重构 README “字符集配置详解”章节，推荐使用 `Presets` 常量。
- 补全中英文 API Props 对齐。

---

## [1.1.0] - 2026-01-04

### ✨ 新功能
- **`prefix` / `suffix`** — 静态前后缀支持，不参与滚动动画
- **`disabled`** — 禁用动画，直接显示最终值
- **`onAnimationEnd` / `@animation-end`** — 动画结束回调
- **自定义 easing 函数** — 支持传入 `(t: number) => number` 函数
- **`animateOnMount`** — 控制首次加载是否播放动画（默认 `false`）

### 🐛 修复
- **Emoji 宽度检测** — 使用 `codePointAt` 正确处理高位 Unicode（emoji）
- **扩展拉丁字符误判** — 如 `ĀāĒē` 不再被误判为全角字符
- **Vue 首次渲染动画** — 首次加载时不再自动播放动画

### ⚡ 性能优化
- **提取 `isFW`/`getW` 函数** — 避免每帧重复创建函数对象
- **React 外部化配置增强** — 添加 `react-dom/client` 和正则匹配，解决 React 19 兼容问题

### 📝 文档
- 更新 API Props 表格
- 同步 `vue-demo.html` 所有功能

---

## [1.0.4] - 2025-12-28

### ✨ 初始发布
- Levenshtein diff 算法智能文本差异
- React 18+ / Vue 3+ 双框架支持
- 内置 `linear`、`easeInOut`、`bounce` 等缓动函数
- 中英文、数字、符号混合滚动
- 动画中断平滑过渡
