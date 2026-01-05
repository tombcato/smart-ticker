<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import Ticker from '../../../src/components/vue/Ticker.vue'
import { Presets } from '../../../src/core/TickerCore'
import '../../../src/components/Ticker.css'

type DemoMode = 'price' | 'text' | 'intl-currency'

const mode = ref<DemoMode>('price')
const value = ref<string | number>(173.50)
const charWidth = ref(1)
const duration = ref(800)
const easing = ref<import('../../../src/core/TickerCore').EasingName>('easeOutCubic')
const autoScale = ref(false)
const fadingEdge = ref(true)

// New controls
const direction = ref<'ANY' | 'UP' | 'DOWN'>('ANY')
const prefix = ref('')
const suffix = ref('')
const disableAnimation = ref(false)
const copied = ref(false)

const activeFormatter = ref<Intl.NumberFormat | undefined>()
const activeIntlParams = ref<{ locale: string, options: Intl.NumberFormatOptions }>({ 
  locale: 'en-US', 
  options: { style: 'currency', currency: 'USD' } 
})

let timer: any

function startTimer() {
  clearInterval(timer)
  if (mode.value === 'price') {
    const prices = [973.18, 976.58, 1073.50, 97.10]
    let idx = 0
    value.value = prices[0]
    timer = setInterval(() => {
      idx = (idx + 1) % prices.length
      value.value = prices[idx]
    }, 2000)
  } else if (mode.value === 'intl-currency') {
    const intlConfig: { val: number, locale: string, options: Intl.NumberFormatOptions }[] = [
        { val: 1234.56, locale: 'en-US', options: { style: 'currency', currency: 'USD' } },
        { val: 0.455, locale: 'zh-CN', options: { style: 'percent', minimumFractionDigits: 1 } },
        { val: 92458, locale: 'en-US', options: { style: 'unit', unit: 'meter-per-second' } },
        { val: 4544654321, locale: 'zh-CN', options: { notation: 'compact', compactDisplay: 'long' } },
        { val: 23456.78, locale: 'de-DE', options: { style: 'currency', currency: 'EUR' } },
    ]
    let idx = 0
    const update = (i: number) => {
        const conf = intlConfig[i]
        value.value = conf.val
        activeFormatter.value = new Intl.NumberFormat(conf.locale, conf.options)
        activeIntlParams.value = { locale: conf.locale, options: conf.options }
    }
    update(0)

    timer = setInterval(() => {
        idx = (idx + 1) % intlConfig.length
        update(idx)
    }, 3000)
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
  { key: 'easeOutCubic', label: '柔和' },
  { key: 'easeOutExpo', label: '极速' },
  { key: 'backOut', label: '灵动' },
]

const currentCharacterLists = computed(() => {
  return mode.value === 'text'
    ? [
        Presets.ALPHABET, 
        Presets.ALPHABET.toUpperCase(),
        Presets.NUMBER,
        ' .%v-@#$'
      ]
    : (mode.value === 'intl-currency' ? [Presets.CURRENCY] : [Presets.NUMBER])
})

const displayValue = computed(() => {
  return mode.value === 'intl-currency' 
    ? Number(value.value) 
    : (mode.value === 'price' ? Number(value.value).toFixed(2) : String(value.value))
})

const copyCode = () => {
  const code = document.querySelector('.code-section code')?.textContent || ''
  navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="app-container">
    <header>
      <div class="header-title">
        <img src="/logo.svg" alt="logo" class="logo" />
        <h1>Smart Ticker - Vue Demo</h1>
      </div>

    </header>

    <div class="ticker-display" :style="{ width: autoScale ? '100%' : undefined }">

      <div class="ticker-main" :style="autoScale ? { minWidth: 0, display: 'flex', justifyContent: 'center', width: '100%' } : undefined">
        <Ticker
          :value="displayValue"
          :duration="duration"
          :easing="easing"
          :char-width="charWidth"
          :character-lists="currentCharacterLists"
          :direction="direction"
          :prefix="prefix"
          :suffix="suffix"
          :disable-animation="disableAnimation"
          :auto-scale="autoScale"
          :fading-edge="fadingEdge"
          :number-format="activeFormatter"
        />
      </div>
    </div>

    <div class="controls">
      <!-- 模式切换 -->
      <div class="control-group">
        <div class="label">演示模式</div>
        <div class="options">
          <button :class="{ active: mode === 'price' }" @click="mode = 'price'">数字</button>
          <button :class="{ active: mode === 'intl-currency' }" @click="mode = 'intl-currency'">Intl 格式化</button>
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
        <div class="options" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
          <button
            v-for="e in easingOptions"
            :key="e.key"
            :class="{ active: easing === e.key }"
            @click="easing = e.key as import('../../../src/core/TickerCore').EasingName"
          >
            {{ e.label }}
          </button>
        </div>
      </div>

      <!-- 滚动方向控制 -->
      <div class="control-group">
        <div class="label">滚动方向</div>
        <div class="options">
          <button v-for="d in (['ANY', 'UP', 'DOWN'] as const)" :key="d" :class="{ active: direction === d }" @click="direction = d">
            {{ d }}
          </button>
        </div>
      </div>

      <!-- 装饰与控制 -->
      <div class="control-group">
        <div class="label">装饰与控制</div>
        <div class="options" style="flex-direction: column; gap: 8px; align-items: stretch;">
             <div style="display: flex; gap: 8px; justify-content: center;">
                <div style="position: relative;">
                    <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #a0a3bd; pointer-events: none;">前</span>
                    <input 
                      type="text" 
                      v-model="prefix"
                      style="padding: 6px 8px 6px 24px; border-radius: 6px; border: 1px solid #e0e0e0; width: 80px; text-align: center; font-size: 14px; outline: none; color: #1a1d2d;"
                    />
                </div>
                <div style="position: relative;">
                    <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #a0a3bd; pointer-events: none;">后</span>
                    <input 
                      type="text" 
                      v-model="suffix"
                      style="padding: 6px 8px 6px 24px; border-radius: 6px; border: 1px solid #e0e0e0; width: 80px; text-align: center; font-size: 14px; outline: none; color: #1a1d2d;"
                    />
                </div>
             </div>
             <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 4px;">
                 <button :class="{ active: autoScale }" @click="autoScale = !autoScale" style="font-size: 13px; padding: 4px 10px; border: 1px solid #e0e0e0;">
                    自动缩放
                 </button>
                 <button :class="{ active: fadingEdge }" @click="fadingEdge = !fadingEdge" style="font-size: 13px; padding: 4px 10px; border: 1px solid #e0e0e0;">
                    边缘模糊
                 </button>
                 <button :class="{ active: disableAnimation }" @click="disableAnimation = !disableAnimation" style="font-size: 13px; padding: 4px 10px; border: 1px solid #e0e0e0;">
                    禁用动画
                 </button>
             </div>
        </div>
      </div>
    </div>

    <footer class="code-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="margin: 0;">💻 使用代码</h2>
        <button 
          @click="copyCode"
          :style="{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e0e0e0',
              background: copied ? '#4a6bff' : '#fff',
              color: copied ? '#fff' : '#666',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
          }"
        >
          {{ copied ? '✓ 已复制' : '📋 复制' }}
        </button>
      </div>
      <pre><code>import { Ticker, Presets } from '@tombcato/smart-ticker/vue
import '@tombcato/smart-ticker/style.css'
{{ mode === 'intl-currency' ? `
// Intl.NumberFormat 实例
const formatter = new Intl.NumberFormat(
    '${activeIntlParams.locale}', 
    ${JSON.stringify(activeIntlParams.options).replace(/"/g, "'")})
` : '' }}
&lt;Ticker
  value={ {{ typeof displayValue === 'number' ? displayValue : `"${displayValue}"` }} }
  duration={ {{ duration }} }
  easing="{{ easing }}"
  charWidth={ {{ charWidth }} }
  direction="{{ direction }}"{{ prefix ? `
  prefix="${prefix}"` : '' }}{{ suffix ? `
  suffix="${suffix}"` : '' }}{{ disableAnimation ? `
  disableAnimation` : '' }}
  characterLists={ {{ mode === 'text' ? '[Presets.ALPHABET, Presets.NUMBER, " .%@#$"]' : (mode === 'intl-currency' ? 'Presets.CURRENCY' : 'Presets.NUMBER') }} }{{ mode === 'intl-currency' ? `
  numberFormat={formatter}` : '' }}{{ autoScale ? `
  autoScale` : '' }}{{ fadingEdge ? `
  fadingEdge` : '' }}
/&gt;</code></pre>
    </footer>
  </div>
</template>

<style scoped>
/* 留空，使用全局样式 */
</style>
