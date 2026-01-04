# Changelog

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
