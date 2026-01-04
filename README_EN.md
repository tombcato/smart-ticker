<p align="center">
  <img src="./public/logo.svg#gh-light-mode-only" alt="Smart Ticker" width="120" />
  <img src="./public/logo-dark.svg#gh-dark-mode-only" alt="Smart Ticker" width="120" />
</p>

<h1 align="center">Smart Ticker</h1>

  High-performance smart text ticker component based on Levenshtein diff algorithm. Supports CJK, numbers, letters, emojis, and mixed charsets. <a href="https://tombcato.github.io/smart-ticker/">Live Demo ></a>

<p align="center">
  <a href="./README.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
  <img src="./smartticker.gif" alt="Demo" width="600" />
</p>
<p align="center">
  <img src="./smartticker2.gif" alt="Demo" width="600" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vue-3+-4FC08D?logo=vuedotjs" alt="Vue" />
  <img src="https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/npm/v/@tombcato/smart-ticker?color=cb3837&logo=npm" alt="npm" />
</p>


| | |
| :--- | :--- |
| **🌏 Multi-Charset Support**<br>Supports CJK, Numbers, Emojis, and mixed text rolling. Auto-adjusts spacing based on Unicode width. | **🧠 Smart Diff Animation**<br>Uses Levenshtein algorithm to find the shortest change path; identical characters remain static. |
| **⚡ Smooth Interruption**<br>Seamlessly transitions to new targets if the value changes dynamically during animation. | **📈 Rich Motion**<br>Built-in `linear`, `bounce`, `easeInOut` easings. Supports `charWidth` for fine-tuning. |
| **🦄 Dual Framework**<br>Provides both React (Hooks) and Vue 3 (Composition) components with a unified API. | **🚀 High Performance**<br>Powered by `RAF`, removing DOM overhead, optimized for high-frequency data streams. |

## 📦 Installation

### NPM (Recommended)

```bash
npm install @tombcato/smart-ticker
```

### From Source

```bash
# Clone repository
git clone https://github.com/tombcato/smart-ticker.git

# Install dependencies
cd smart-ticker
npm install

# Start dev server
npm run dev
```

## 🚀 Usage

### 📦 Import Styles

When using **NPM**, you **MUST** explicitly import the style file for the component to work.

```javascript
import '@tombcato/smart-ticker/style.css'
```

> **Source Integration**: If copying source code, ensure React version imports `Ticker.css` and Vue version uses the built-in styles.

### React

```tsx
// NPM Usage
import { Ticker } from '@tombcato/smart-ticker';
import '@tombcato/smart-ticker/style.css';

// Source Usage
// import { Ticker } from './components/Ticker';

function App() {
  const [price, setPrice] = useState(73.18);

  return (
    <Ticker
      value={price.toFixed(2)}
      duration={800}
      easing="easeInOut"
      charWidth={1}
      characterLists={['0123456789.,']}
    />
  );
}
```

### Vue

```vue
<script setup>
// NPM Usage
import { Ticker } from '@tombcato/smart-ticker/vue';
import '@tombcato/smart-ticker/style.css';

// Source Usage
// import Ticker from './components/vue/Ticker.vue';

import { ref } from 'vue';

const price = ref('73.18');
</script>
<template>
  <Ticker
    :value="price"
    :duration="800"
    easing="easeInOut"
    :char-width="1"
    :character-lists="['0123456789.,']"
  />
</template>
```

### 💅 Customization

#### Custom Fonts

The component uses the system monospace stack by default. To use a custom font (e.g., `JetBrains Mono`), ensure it is **monospace** and override via CSS:

```css
/* In global styles or component styles */
.ticker {
  font-family: 'JetBrains Mono', monospace !important;
}
```

> **Note**: Must be a **monospace font**, otherwise alignment issues may occur during scrolling animations.

## ⚙️ API

### Props

| Prop | Type | Default | Description |
|------|------|--------|------|
| `value` | `string` | - | The text value to display (Required) |
| `duration` | `number` | `500` | Animation duration (ms) |
| `easing` | `EasingName \| function` | `'easeInOut'` | Easing: `linear`, `easeIn`, `easeOut`, `easeInOut`, `bounce`, or custom `(t: number) => number` |
| `direction` | `string` | `'ANY'` | Scroll direction: `UP`, `DOWN`, `ANY` (shortest path) |
| `charWidth` | `number` | `1` | Character width multiplier (base 0.8em) |
| `characterLists` | `string[]` | `['0123456789']` | Allowed character sets |
| `className` | `string` | `''` | Custom CSS class name |
| `animateOnMount` | `boolean` | `false` | Animate on initial render |
| `disabled` | `boolean` | `false` | Disable animation, show final value immediately |
| `prefix` | `string` | - | Static prefix (not animated) |
| `suffix` | `string` | - | Static suffix (not animated) |
| `onAnimationEnd` | `() => void` | - | Callback when animation ends (Vue: `@animation-end`) |

### Built-in Character Lists

```ts
import { TickerUtils } from './components/Ticker';

TickerUtils.provideNumberList()        // '0123456789'
TickerUtils.provideAlphabeticalList()  // 'abc...zABC...Z'

### 🧩 Character Configuration

`characterLists` controls the core animation logic. It accepts an array of strings, where each string represents a group of characters that can **scroll into each other**.

**Rules:**
1.  **Scroll**: If both the old and new characters belong to the same group string (e.g., `0` to `9` in `'0123456789'`), they will scroll.
2.  **Switch**: If they are in different groups, or if a character is not in any list (e.g., Chinese characters), they will switch instantly without scrolling.

**Configuration Tips:**

*   `TickerUtils.provideAlphabeticalList()` includes both `a-z` and `A-Z`.
*   To prevent scrolling between cases (e.g., `a` -> `A`), provide them as separate strings: `['abc...', 'ABC...']`.

**Example:**

```javascript
characterLists={[
  'abcdefghijklmnopqrstuvwxyz', // Lowercase group
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // Uppercase group
  '0123456789',                 // Number group
  '.,!@#$%^&*'                  // Symbol group
]}
```
```

## 💻 Running Demos

This project includes complete NPM-based user examples for React and Vue in the `examples` directory.

### Start React Demo

```bash
cd examples/react-demo
npm install
npm run dev
# Demo runs at http://localhost:5179
```

### Start Vue Demo

```bash
cd examples/vue-demo
npm install
npm run dev
# Demo runs at http://localhost:5180
```

## 📁 Project Structure

```
smart-ticker/
├── src/
│   ├── components/
│   │   ├── Ticker.tsx      # React Component Source
│   │   ├── Ticker.css      # Component Core Styles
│   │   └── vue/
│   │       └── Ticker.vue  # Vue Component Source
│   ├── core/
│   │   └── TickerCore.ts   # Core Logic (Levenshtein diff algo)
│   └── ...
├── examples/               # Standalone Example Projects
│   ├── react-demo/         # React Demo (Vite + React + TS)
│   └── vue-demo/           # Vue Demo (Vite + Vue + TS)
├── public/
│   └── vue-demo.html       # Single File CDN Demo
└── package.json
```

## 🎨 Example Scenarios

- **Financial Data** - Stock prices, crypto rates
- **Counters** - Page views, likes
- **Scoreboards** - Real-time sports scores
- **Airport Info** - Flight numbers, gates
- **Privacy Mode** - Balance hide/show toggle

## 🔧 Tech Stack

- **Build Tool**: Vite
- **Language**: TypeScript
- **Frameworks**: React 18 / Vue 3
- **Styling**: CSS Variables + Responsive Design

## 📝 Changelog

See [CHANGELOG_EN.md](./CHANGELOG_EN.md) for version history.

## 📄 License

MIT
