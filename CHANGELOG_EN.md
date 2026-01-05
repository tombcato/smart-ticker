# Changelog

## [1.2.0] - 2026-01-06

### ✨ New Features
- **Core Functionality Upgrade**
    - **Intl Support**: Added `numberFormat` prop for `value` (number type), leveraging `Intl.NumberFormat` for internationalized formatting.
    - **`autoScale`**: Automatically scales content to fit container (requires parent container with defined dimensions).
    - **`fadingEdge`**: Added top/bottom fading edge effects.
    - **`disableAnimation`**: Option to disable animation entirely.
    - **Easing Enhancements**: Added more built-in easing options (e.g., `easeOutBack`) and optimized type support for custom easing functions.
    - **Prefix/Suffix Refinement**: Improved `prefix` and `suffix` props to ensure static text stays stable during layout changes and is excluded from column scrolling logic.
    - **A11y & Reduced Motion**: ARIA + Screen Reader support。Automatically respects system `prefers-reduced-motion` preferences (can be overridden via `disableAnimation`).
- **Vue Component Sync**
    - **Prop Alignment**: Synced `prefix`, `suffix`, `autoScale`, `fadingEdge`, and `numberFormat` props to the Vue version.
    - **Events**: Added `@animation-end` event emission.
    - **Intl Support**: Optimized reactive logic for `:number-format` to support real-time updates for international formatting.
- **Official Site Overhaul** — UI adjustments, more control options in Demo, real-time React/Vue code preview, 100% bilingual (EN/ZH) support, and one-click StackBlitz export.
- **Character Presets** — Replaced `TickerUtils` with `Presets` constants (`NUMBER`, `ALPHABET`, `CURRENCY`, `ALPHANUMERIC`).

### ⚡ Performance & Optimization
- **Zero-Latency Initialization** — Synchronously calculate ticker columns on mount to eliminate the "blank flash" on page refresh.
- **Animation Continuity** — Refined value update logic during mounting to ensure smooth transitions from the very first data change.
- **Data Loop Optimization** — Demo updates now trigger immediately upon mounting without waiting for the first interval.

### 📝 Documentation
- Reorganized README's "Character Configuration" section to recommend `Presets` usage.
- Simplified API Props tables and synchronized EN/ZH versions.

---

## [1.1.0] - 2026-01-04

### ✨ New Features
- **`prefix` / `suffix`** — Static prefix/suffix support (not animated)
- **`disabled`** — Skip animation, display final value immediately
- **`onAnimationEnd` / `@animation-end`** — Callback when animation completes
- **Custom easing function** — Pass `(t: number) => number` directly
- **`animateOnMount`** — Control initial render animation (default `false`)

### 🐛 Bug Fixes
- **Emoji width detection** — Use `codePointAt` for high Unicode (emoji) support
- **Extended Latin misdetection** — Characters like `ĀāĒē` no longer misidentified as full-width
- **Vue initial animation** — No animation on first render by default

### ⚡ Performance
- **Extract `isFW`/`getW` functions** — Avoid recreating functions per frame
- **Enhanced React externalization** — Add `react-dom/client` and regex patterns for React 19 compatibility

### 📝 Documentation
- Updated API Props table
- Synced all features to `vue-demo.html`

---

## [1.0.4] - 2025-12-28

### ✨ Initial Release
- Levenshtein diff algorithm for smart text diffing
- React 18+ / Vue 3+ dual framework support
- Built-in `linear`, `easeInOut`, `bounce` easing functions
- CJK, numbers, symbols, emoji mixed scrolling
- Smooth animation interruption handling
