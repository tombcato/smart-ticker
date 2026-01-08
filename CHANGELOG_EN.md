# Changelog

## [1.2.3] - 2026-01-08

### ✨ New Features
- **Svelte Framework Support**
    - **Native Component**: First-class support for Svelte! Import via standard path: `import { Ticker } from '@tombcato/smart-ticker/svelte'`.
    - **Demo Project**: Added `examples/svelte-demo`, providing a complete integration reference.
    - **Official Site Upgrade**: The official demo now fully supports real-time preview and generation of Svelte code.
- **Core Functionality Upgrade (Core)**
    - **Intl Support**: Added `numberFormat` prop for `value` (number type), leveraging `Intl.NumberFormat` for internationalized formatting.
    - **`autoScale`**: Automatically scales content to fit container (requires parent container with defined dimensions).
    - **`fadingEdge`**: Added top/bottom fading edge effects.
    - **`disableAnimation`**: Option to disable animation entirely (`disabled` prop). Useful for static displays.
    - **Easing Enhancements**: Added more built-in easing options (e.g., `easeOutBack`) and optimized type support for custom easing functions (`(t: number) => number`).
    - **Prefix/Suffix Refinement**: Improved `prefix` and `suffix` props to ensure static text stays stable during layout changes and is excluded from column scrolling logic.
    - **A11y & Reduced Motion**: automatically respects system `prefers-reduced-motion` preferences with ARIA support.
    - **`animateOnMount`**: Control initial render animation (default `false`).
- **Events**
    - **`onAnimationEnd` / `@animation-end`**: Callback when animation completes.
- **Vue Component Sync**
    - **Prop Alignment**: Synced `prefix`, `suffix`, `autoScale`, `fadingEdge`, and `numberFormat` props to the Vue version.
    - **Intl Support**: Optimized reactive logic for `:number-format` to support real-time updates for international formatting.
- **Official Site Overhaul** — UI adjustments, more control options in Demo, real-time React/Vue code preview, 100% bilingual (EN/ZH) support, and one-click StackBlitz export.
- **Character Presets** — Replaced `TickerUtils` with `Presets` constants (`NUMBER`, `ALPHABET`, `CURRENCY`) for easier configuration.

### 🐛 Bug Fixes
- **Emoji width detection** — Use `codePointAt` for high Unicode (emoji) support.
- **Extended Latin misdetection** — Characters like `ĀāĒē` no longer misidentified as full-width.
- **Vue initial animation** — No animation on first render by default.

### ⚡ Performance & Optimization
- **Zero-Latency Initialization** — Synchronously calculate ticker columns on mount to eliminate the "blank flash" on page refresh.
- **Animation Continuity** — Refined value update logic during mounting to ensure smooth transitions from the very first data change.
- **Performance** — Optimized data loop; extracted internal `isFW`/`getW` helpers; enhanced React 19 compatibility.

### 📝 Documentation
- Reorganized README's "Character Configuration" section to recommend `Presets` usage.
- Simplified API Props tables and synchronized EN/ZH versions.

---



### ✨ Initial Release
- Levenshtein diff algorithm for smart text diffing
- React 18+ / Vue 3+ dual framework support
- Built-in `linear`, `easeInOut`, `bounce` easing functions
- CJK, numbers, symbols, emoji mixed scrolling
- Smooth animation interruption handling
