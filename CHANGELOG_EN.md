# Changelog

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
