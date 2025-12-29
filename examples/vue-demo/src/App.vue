<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Ticker, TickerUtils } from '@tombcato/smart-ticker/vue'
import '@tombcato/smart-ticker/style.css'

type DemoMode = 'price' | 'text'

const mode = ref<DemoMode>('price')
const value = ref<string | number>(173.50)
const charWidth = ref(1)
const duration = ref(800)
const easing = ref('easeInOut')

let timer: number

function startTimer() {
  clearInterval(timer)
  if (mode.value === 'price') {
    const prices = [73.18, 76.58, 173.50, 9.10]
    let idx = 0
    value.value = prices[0]
    timer = setInterval(() => {
      idx = (idx + 1) % prices.length
      value.value = prices[idx]
    }, 2000)
  } else {
    // 精心设计的 Diff 演示序列
    const words = [
        'Smart Ticker',
        'Small Diff',
        '哈基米 Dif@#$',
        '硅基生命 %@#$',
        '宇宙生命 Smart',
    ]
    let idx = 0
    value.value = words[0]
    timer = setInterval(() => {
      idx = (idx + 1) % words.length
      value.value = words[idx]
    }, 2000)
  }
}

watch(mode, () => {
  startTimer()
})

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  clearInterval(timer)
})

const widthOptions = [0.8, 1, 1.2]
const durationOptions = [400, 800, 1200]
const easingOptions = [
  { key: 'linear', label: '线性' },
  { key: 'easeInOut', label: '先加后减' },
  { key: 'bounce', label: '回弹' },
]

const currentCharacterLists = computed(() => {
  return mode.value === 'price'
    ? ['0123456789.,']
    : [
        TickerUtils.provideAlphabeticalList(), 
        TickerUtils.provideAlphabeticalList().toUpperCase(),
        TickerUtils.provideNumberList(),
        ' .%v-@#$'
      ]
})

const displayValue = computed(() => {
  return mode.value === 'price' ? Number(value.value).toFixed(2) : String(value.value)
})

// For code display
const charListCode = computed(() => {
  return mode.value === 'price' 
    ? "['0123456789.,']" 
    : "[TickerUtils.provideAlphabeticalList()]"
})
</script>

<template>
  <div class="app-container">
    <header>
      <div class="header-title">
        <img src="/logo.svg" alt="logo" class="logo" />
        <h1>Smart Ticker - Vue Demo</h1>
      </div>
      <p class="subtitle">通过 npm install @tombcato/smart-ticker 引入</p>
    </header>

    <div class="ticker-display">
      <span v-if="mode === 'price'" class="currency-symbol">$</span>
      <div class="ticker-main">
        <Ticker
          :value="displayValue"
          :duration="duration"
          :easing="easing"
          :char-width="charWidth"
          :character-lists="currentCharacterLists"
        />
      </div>
    </div>

    <div class="controls">
      <!-- 模式切换 -->
      <div class="control-group">
        <div class="label">演示模式</div>
        <div class="options">
          <button :class="{ active: mode === 'price' }" @click="mode = 'price'">数字</button>
          <button :class="{ active: mode === 'text' }" @click="mode = 'text'">文本</button>
        </div>
      </div>

      <!-- 字符宽度控制 -->
      <div class="control-group">
        <div class="label">字符宽度</div>
        <div class="options">
          <button
            v-for="w in widthOptions"
            :key="w"
            :class="{ active: charWidth === w }"
            @click="charWidth = w"
          >
            {{ w }}x
          </button>
        </div>
      </div>

      <!-- 动画时长控制 -->
      <div class="control-group">
        <div class="label">动画时长</div>
        <div class="options">
          <button
            v-for="d in durationOptions"
            :key="d"
            :class="{ active: duration === d }"
            @click="duration = d"
          >
            {{ d }}ms
          </button>
        </div>
      </div>

      <!-- 缓动曲线控制 -->
      <div class="control-group">
        <div class="label">缓动曲线</div>
        <div class="options">
          <button
            v-for="e in easingOptions"
            :key="e.key"
            :class="{ active: easing === e.key }"
            @click="easing = e.key"
          >
            {{ e.label }}
          </button>
        </div>
      </div>
    </div>

    <footer class="code-section">
      <h2>💻 使用代码</h2>
      <pre><code>import { Ticker, TickerUtils } from '@tombcato/smart-ticker/vue'
import '@tombcato/smart-ticker/style.css'

&lt;Ticker
  value="{{ displayValue }}"
  :duration="{{ duration }}"
  easing="{{ easing }}"
  :char-width="{{ charWidth }}"
  :character-lists="{{ charListCode }}"
/&gt;</code></pre>
    </footer>
  </div>
</template>

<style scoped>
/* 留空，使用全局样式 */
</style>
