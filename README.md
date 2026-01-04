<p align="center">
  <img src="./public/logo.svg#gh-light-mode-only" alt="Smart Ticker" width="120" />
  <img src="./public/logo-dark.svg#gh-dark-mode-only" alt="Smart Ticker" width="120" />
</p>

<h1 align="center">Smart Ticker</h1>

<p align="center">
  高性能智能文本差异滚动组件，支持中英、数字、字母、符号、Emoji等多种字符集，基于 Levenshtein diff 算法，适用于React/Vue，<a href="https://tombcato.github.io/smart-ticker/">官网演示></a>
</p>

<p align="center">
  <strong>简体中文</strong> | <a href="./README_EN.md">English</a>
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


## ✨ 特性
| | |
| :--- | :--- |
| **🌏 多字符集支持**<br>支持中英、数字、Emoji等混合滚动，基于 Unicode 宽度自动调整间距 | **🧠 智能差异动画**<br>Levenshtein 算法计算最小变更路径，相同的字符保持静止 |
| **⚡ 平滑中断**<br>动画过程中值突变时，从当前动态位置无缝流向新目标 | **📈 丰富动效**<br>内置 `linear`, `bounce`, `easeInOut` 等缓动，支持 `charWidth` 微调 |
| **🦄 双框架支持**<br>提供 React (Hooks) 和 Vue 3 (Composition) 组件，API 统一 | **🚀 极致性能**<br>基于 `RAF` 驱动，无多余 DOM 操作，适合高频数据流场景 |

## 📦 安装

### NPM 安装（推荐）

```bash
npm install @tombcato/smart-ticker
```

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/tombcato/smart-ticker.git

# 安装依赖
cd smart-ticker
npm install

# 启动开发服务器
npm run dev
```

## 🚀 使用方法

### 📦 引入样式 (Import Styles)

**NPM 安装**时，**必须**显式引入样式文件组件才能正常工作。

```javascript
import '@tombcato/smart-ticker/style.css'
```

> **源码集成**：如果您直接复制组件源码，React 版本需确保引入同目录的 `Ticker.css`，Vue 版本样式已内置在单文件组件中。

### React

```tsx
// NPM 方式
import { Ticker } from '@tombcato/smart-ticker';
import '@tombcato/smart-ticker/style.css';

// 源码方式
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
// NPM 方式
import { Ticker } from '@tombcato/smart-ticker/vue';
import '@tombcato/smart-ticker/style.css';

// 源码方式
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

### 💅 样式自定义

#### 自定义字体

组件默认使用系统等宽字体栈。如果需要使用自定义字体（如 `JetBrains Mono`），请确保该字体是**等宽字体**，并使用 CSS 覆盖：

```css
/* 全局样式或组件样式中 */
.ticker {
  font-family: 'JetBrains Mono', monospace !important;
}
```

> **注意**：必须使用**等宽字体**，否则字符滚动动画的对齐可能会出现偏差。


## ⚙️ API
### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | - | 要显示的文本值（必填） |
| `duration` | `number` | `500` | 动画持续时间（毫秒） |
| `easing` | `EasingName \| function` | `'easeInOut'` | 缓动函数：`linear`、`easeIn`、`easeOut`、`easeInOut`、`bounce`，或自定义 `(t: number) => number` |
| `direction` | `string` | `'ANY'` | 滚动方向：`UP`、`DOWN`、`ANY`（自动选择最短路径） |
| `charWidth` | `number` | `1` | 字符宽度倍率（基准为 0.8em） |
| `characterLists` | `string[]` | `['0123456789']` | 支持的字符列表 |
| `className` | `string` | `''` | 自定义 CSS 类名 |
| `animateOnMount` | `boolean` | `false` | 首次加载时是否播放动画 |
| `disabled` | `boolean` | `false` | 禁用动画，直接显示最终值 |
| `prefix` | `string` | - | 静态前缀（不参与滚动动画） |
| `suffix` | `string` | - | 静态后缀（不参与滚动动画） |
| `onAnimationEnd` | `() => void` | - | 动画结束回调（Vue: `@animation-end`） |

### 内置字符列表

```ts
import { TickerUtils } from './components/Ticker';

TickerUtils.provideNumberList()        // '0123456789'
TickerUtils.provideAlphabeticalList()  // 'abc...zABC...Z'

### 🧩 字符集配置详解

`characterLists` 是控制 Ticker 动画逻辑的核心配置。它接受一个字符串数组，数组的每一项代表一组**“可以互相滚动”**的字符。

**基本规则：**
1.  **同组滚动**：如果旧字符和新字符在同一个字符串中（例如 `0` 变 `9` 在 `'0123456789'` 中），它们会产生滚动动画。
2.  **跨组替换**：如果它们不在同一组（例如 `a` 变 `1`），或者任何一个字符不在配置列表中（例如汉字），它们会原地切换（Switch），不会产生滚动。

**配置技巧：**

*   **默认全字母**：`TickerUtils.provideAlphabeticalList()` 默认包含 `a-z` 和 `A-Z`。如果你希望大小写之间可以滚动（如 `a` -> `A`），使用它即可。
*   **由于物理隔离**：如果你不希望小写字母滚动变成大写字母（希望它们直接切换），请将它们配置为两个独立的字符串，例如 `['abc...', 'ABC...']`。

**示例：**

```javascript
// 场景：数字、字母（大小写隔离）、符号
characterLists={[
  'abcdefghijklmnopqrstuvwxyz', // 小写组
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // 大写组
  '0123456789',                 // 数字组
  '.,!@#$%^&*'                  // 符号组
]}
```
```

## 💻 运行演示

本项目提供了完整基于 NPM 的 React 和 Vue 示例工程，位于 `examples` 目录下。

### 启动 React Demo

```bash
cd examples/react-demo
npm install
npm run dev
```

### 启动 Vue Demo

```bash
cd examples/vue-demo
npm install
npm run dev
```

## 📁 项目结构

```
smart-ticker/
├── src/
│   ├── components/
│   │   ├── Ticker.tsx      # React 组件源码
│   │   ├── Ticker.css      # 组件核心样式
│   │   └── vue/
│   │       └── Ticker.vue  # Vue 组件源码
│   ├── core/
│   │   └── TickerCore.ts   # 核心逻辑（Levenshtein diff 算法）
│   └── ...
├── examples/               # 独立示例工程
│   ├── react-demo/         # React Demo (Vite + React + TS)
│   └── vue-demo/           # Vue Demo (Vite + Vue + TS)
├── public/
│   └── vue-demo.html       # 单文件 CDN 引用示例
└── package.json
```

## 🎨 示例场景

- **金融数据** - 股票价格、加密货币行情
- **计数器** - 访问量、点赞数
- **比分牌** - 体育比赛实时比分
- **机场信息牌** - 航班号、登机口
- **隐私模式** - 余额隐藏/显示切换

## 🔧 技术栈

- **构建工具**: Vite
- **语言**: TypeScript
- **框架**: React 18 / Vue 3
- **样式**: CSS Variables + 响应式设计

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新详情。

## 📄 License
MIT
