# Ticker - 智能文本滚动动画组件

> 灵感来自 [Robinhood Ticker](https://github.com/robinhood/ticker)，使用 TypeScript 重新实现，支持 React 和 Vue。

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![Vue](https://img.shields.io/badge/Vue-3+-4FC08D?logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)

## ✨ 特性

- **智能差异动画** - 只有变化的字符会滚动，相同的字符保持静止
- **平滑中断** - 动画过程中值变化时，从当前位置无缝衔接到新目标
- **多种缓动曲线** - 支持 `linear`、`easeInOut`、`bounce` 等多种动画效果
- **字符宽度可调** - 通过 `charWidth` 属性控制字符间距
- **双框架支持** - 提供 React 组件和 Vue 组件
- **高性能** - 使用 `requestAnimationFrame` 和 `React.memo` 优化渲染

## 📦 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/ticker-smart-text-diff.git

# 安装依赖
cd ticker-smart-text-diff
npm install

# 启动开发服务器
npm run dev
```

## 🚀 使用方法

### React

```tsx
import { Ticker } from './components/Ticker';

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
<template>
  <Ticker
    :value="price"
    :duration="800"
    easing="easeInOut"
    :char-width="1"
    :character-lists="['0123456789.,']"
  />
</template>

<script setup>
import Ticker from './components/vue/Ticker.vue';
import { ref } from 'vue';

const price = ref('73.18');
</script>
```

## ⚙️ API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | - | 要显示的文本值（必填） |
| `duration` | `number` | `500` | 动画持续时间（毫秒） |
| `easing` | `string` | `'easeInOut'` | 缓动函数：`linear`、`easeIn`、`easeOut`、`easeInOut`、`bounce` |
| `direction` | `string` | `'ANY'` | 滚动方向：`UP`、`DOWN`、`ANY`（自动选择最短路径） |
| `charWidth` | `number` | `1` | 字符宽度倍率（基准为 0.8em） |
| `characterLists` | `string[]` | `['0123456789']` | 支持的字符列表 |
| `className` | `string` | `''` | 自定义 CSS 类名 |

### 内置字符列表

```ts
import { TickerUtils } from './components/Ticker';

TickerUtils.provideNumberList()        // '0123456789'
TickerUtils.provideAlphabeticalList()  // 'abcdefghijklmnopqrstuvwxyz'
TickerUtils.provideHexadecimalList()   // '0123456789ABCDEF'
```

## 🎨 示例场景

- **金融数据** - 股票价格、加密货币行情
- **计数器** - 访问量、点赞数
- **比分牌** - 体育比赛实时比分
- **机场信息牌** - 航班号、登机口
- **隐私模式** - 余额隐藏/显示切换

## 📁 项目结构

```
ticker-smart-text-diff/
├── src/
│   ├── components/
│   │   ├── Ticker.tsx      # React 组件
│   │   ├── Ticker.css      # 组件样式
│   │   └── vue/
│   │       └── Ticker.vue  # Vue 组件
│   ├── core/
│   │   └── TickerCore.ts   # 核心逻辑（框架无关）
│   ├── App.tsx             # React Demo
│   └── App.css             # Demo 样式
├── public/
│   └── vue-demo.html       # Vue CDN Demo
└── package.json
```

## 🔧 技术栈

- **构建工具**: Vite
- **语言**: TypeScript
- **框架**: React 18 / Vue 3
- **样式**: CSS Variables + 响应式设计

## 📄 License

MIT

## 🙏 致谢

- [Robinhood Ticker](https://github.com/robinhood/ticker) - 原始 Android 实现
