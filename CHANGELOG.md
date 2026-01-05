# Changelog

## [1.2.0] - 2026-01-06

### ✨ 新功能
- **核心功能升级 (Core)**
    - **Intl 支持**：`value`传数字时，支持`numberFormat`属性，配合`Intl.NumberFormat`使用, 支持国际化格式化。
    - **`autoScale`** 自动大小缩放适配容器，注意需要父控件给定宽高。
    - **`fadingEdge`** 上下边缘模糊效果。
    - **`disableAnimation`** 禁用动画（`disabled` 属性）。直接显示最终值，适合无需动画的场景。
    - **缓动函数增强**：增加了更多的内置缓动选项（如 easeOutBack），并优化了自定义 Easing 函数 (`(t: number) => number`) 的类型支持。
    - **前后缀完善**: 完善了 `prefix` / `suffix` 属性，确保静态文本不参与列滚动逻辑，且在布局切换时保持稳定。
    - **无障碍优化 (A11y)**: ARIA + Screen Reader 支持。自动检测系统 `prefers-reduced-motion` 设置，尊重用户减弱动画的偏好。
    - **`animateOnMount`** — 控制首次加载是否播放动画（默认 `false`）。
- **回调事件**
    - **`onAnimationEnd` / `@animation-end`** — 动画结束回调。
- **Vue 组件同步**
    - **属性对齐**：为 Vue 版本同步增加了 prefix、suffix、autoScale、fadingEdge 和 numberFormat等 Props。
    - **Intl 支持**：优化了 :number-format 属性的响应式逻辑，使其能配合国际化格式实时更新。

- **官网改造升级** — UI调整，Demo增加更多控制选项，支持 React/Vue 代码实时预览，100% 适配中英双语切换，集成 StackBlitz 一键导出在线运行。
- **预设字符集** — 提供 `Presets` 常量 (`NUMBER`, `ALPHABET`, `CURRENCY`) 替换旧的通过工具类生成方式。

### 🐛 修复
- **Emoji 宽度检测** — 使用 `codePointAt` 正确处理高位 Unicode（emoji）。
- **扩展拉丁字符误判** — 如 `ĀāĒē` 不再被误判为全角字符。
- **Vue 首次渲染动画** — 首次加载时不再自动播放动画。

### ⚡ 性能与优化
- **同步初始化 (Zero Latency)** — Ticker 组件现在会在挂载瞬间同步计算首屏列状态，彻底解决刷新网页时的“白屏闪烁”问题。
- **连贯滚动增强** — 优化了挂载瞬间的值变更逻辑，确保即使在极速数据更新下，动画也能从初始值平滑过渡。
- **性能优化** — 优化 Demo 数据更新循环；提取 `isFW`/`getW` 函数避免重复创建；优化 React 19 兼容配置。

### 📝 文档
- 重构 README “字符集配置详解”章节，推荐使用 `Presets` 常量。
- 补全中英文 API Props 对齐。

---

## [1.0.4] - 2025-12-28

## [1.0.4] - 2025-12-28

### ✨ 初始发布
- Levenshtein diff 算法智能文本差异
- React 18+ / Vue 3+ 双框架支持
- 内置 `linear`、`easeInOut`、`bounce` 等缓动函数
- 中英文、数字、符号混合滚动
- 动画中断平滑过渡
