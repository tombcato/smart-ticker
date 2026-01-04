<template>
  <div class="ticker" :class="className">
    <span v-if="prefix" class="ticker-prefix">{{ prefix }}</span>
    <div
      v-for="(col, i) in renderedColumns"
      :key="i"
      class="ticker-column"
      :style="{ width: `${col.width * (col.baseW || 0.8) * charWidth}em`, opacity: col.opacity }"
    >
      <div
        v-for="charObj in col.chars"
        :key="charObj.key"
        class="ticker-char"
        :style="{ transform: `translateY(${charObj.offset}em)` }"
      >
        {{ charObj.char === EMPTY_CHAR ? '\u00A0' : charObj.char }}
      </div>
    </div>
    <span v-if="suffix" class="ticker-suffix">{{ suffix }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import {
    TickerCharacterList,
    ScrollingDirection,
    ColumnState,
    EMPTY_CHAR,
    computeColumnActions,
    createColumn,
    setTarget,
    applyProgress,
    easingFunctions,
    EasingName,
    ACTION_INSERT,
    ACTION_SAME,
} from '../../core/TickerCore';

// 全角字符检测（提取到组件外避免每帧重复创建函数）
const isFW = (c: string) => {
    if (!c || c.length === 0) return false;
    // 使用 codePointAt 正确处理 emoji（代理对）
    const code = c.codePointAt(0) || 0;
    return (
        (code >= 0x3000 && code <= 0x9FFF) ||  // CJK 标点 + 汉字
        (code >= 0xAC00 && code <= 0xD7AF) ||  // 韩文
        (code >= 0xFF00 && code <= 0xFFEF) ||  // 全角 ASCII
        (code >= 0x1F300 && code <= 0x1FAFF)   // Emoji 范围
    );
};
const getW = (c: string) => isFW(c) ? 1.25 : 0.8;

// ============================================================================
// Vue Component Setup
// ============================================================================

const props = defineProps({
  value: { type: String, required: true },
  characterLists: { type: Array as () => string[], default: () => ['0123456789'] },
  duration: { type: Number, default: 500 },
  direction: { type: String as () => ScrollingDirection, default: 'ANY' },
  easing: { type: [String, Function] as unknown as () => EasingName | ((t: number) => number), default: 'easeInOut' },
  className: { type: String, default: '' },
  charWidth: { type: Number, default: 1 },
  animateOnMount: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
});

const emit = defineEmits<{
  animationEnd: []
}>();

const columns = ref<ColumnState[]>([]);
const progress = ref(1);
let animId: number | undefined;
let isFirst = true;

// Initialization
const lists = computed(() => props.characterLists.map(s => new TickerCharacterList(s)));
const supported = computed(() => {
    const set = new Set<string>();
    lists.value.forEach(l => l.getSupportedCharacters().forEach(c => set.add(c)));
    return set;
});

// Watch for value changes
watch(() => props.value, (newValue, oldValue) => {
    if (newValue === oldValue) return;

    if (animId) {
        cancelAnimationFrame(animId);
        animId = undefined;
    }

    // Update current columns with current progress if mid-animation
    let currentCols = columns.value;
    if (progress.value < 1 && progress.value > 0) {
        currentCols = currentCols.map(c => applyProgress(c, progress.value, true).col);
    }

    const targetChars = [...newValue];
    const sourceChars = currentCols.map(c => c.currentChar);
    const actions = computeColumnActions(sourceChars, targetChars, supported.value);

    let ci = 0, ti = 0;
    const result: ColumnState[] = [];
    const validCols = currentCols.filter(c => c.currentWidth > 0);

    for (const action of actions) {
        if (action === ACTION_INSERT) {
            result.push(setTarget(createColumn(), targetChars[ti++], lists.value, props.direction));
        } else if (action === ACTION_SAME) {
            const existing = validCols[ci++] || createColumn();
            result.push(setTarget(existing, targetChars[ti++], lists.value, props.direction));
        } else {
            const existing = validCols[ci++] || createColumn();
            result.push(setTarget(existing, EMPTY_CHAR, lists.value, props.direction));
        }
    }

    columns.value = result;

    // 首次渲染：根据 animateOnMount 决定是否动画
    if (isFirst && !props.animateOnMount) {
        isFirst = false;
        progress.value = 1;
        const final = result.map(c => applyProgress(c, 1).col).filter(c => c.currentWidth > 0);
        columns.value = final;
        return;
    }
    isFirst = false;

    // Start Animation (skip if disabled)
    if (props.disabled) {
        progress.value = 1;
        const final = result.map(c => applyProgress(c, 1).col).filter(c => c.currentWidth > 0);
        columns.value = final;
        return;
    }

    progress.value = 0;
    const start = performance.now();
    const dur = props.duration;
    // 支持自定义 easing 函数
    const easeFn = typeof props.easing === 'function' 
        ? props.easing 
        : easingFunctions[props.easing as EasingName] || easingFunctions.linear;
    let lastUpdate = 0;

    const animate = (now: number) => {
        const linearP = Math.min((now - start) / dur, 1);
        const p = easeFn(linearP);
        
        // Throttled update
        const shouldUpdate = now - lastUpdate >= 16 || linearP >= 1;
        
        if (shouldUpdate) {
            lastUpdate = now;
            progress.value = p;
        }

        if (linearP < 1) {
            animId = requestAnimationFrame(animate);
        } else {
            const final = columns.value
                .map(c => applyProgress(c, 1).col)
                .filter(c => c.currentWidth > 0);
            columns.value = final;
            progress.value = 1;
            animId = undefined;
            // 触发 animationEnd 事件
            emit('animationEnd');
        }
    };
    animId = requestAnimationFrame(animate);

}, { immediate: true }); 

onUnmounted(() => {
    if (animId) cancelAnimationFrame(animId);
});

// Derived View Data
const charHeight = 1.2;

const renderedColumns = computed(() => {
    return columns.value.map(col => {
        const { charIdx, delta } = applyProgress(col, progress.value);
        const width = col.sourceWidth + (col.targetWidth - col.sourceWidth) * progress.value;
        if (width <= 0) return { width, chars: [] };

        const chars: Array<{ key: string, char: string, offset: number }> = [];
        const list = col.charList || [];
        const deltaEm = delta * charHeight;

        // Helper to add char
        const add = (idx: number, offsetMod: number, keyPrefix: string) => {
             if (idx >= 0 && idx < list.length) {
                chars.push({
                    key: `${keyPrefix}-${idx}`,
                    char: list[idx],
                    offset: deltaEm + offsetMod
                });
            }
        };

        add(charIdx, 0, 'c');
        add(charIdx + 1, -charHeight, 'n');
        add(charIdx - 1, charHeight, 'p');

        const startChar = list[col.startIndex] || '';
        const endChar = list[col.endIndex] || ''; // endIndex not targetIndex
        const w1 = getW(startChar);
        const w2 = getW(endChar);
        const baseW = w1 + (w2 - w1) * progress.value;

        // 新增/删除列时添加 alpha 渐变
        const isDeleting = col.targetWidth === 0 && col.sourceWidth > 0;
        const isInserting = col.sourceWidth === 0 && col.targetWidth > 0;
        const opacity = isDeleting ? 1 - progress.value : isInserting ? progress.value : 1;

        return { width, chars, baseW, opacity };
    }).filter(c => c.width > 0);
});

</script>

<style scoped>
.ticker {
    display: inline-flex;
    overflow: hidden;
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace, "PingFang SC", "Microsoft YaHei", sans-serif;
    font-weight: 600;
    line-height: 1.2;
}

.ticker-column {
    display: inline-block;
    height: 1.2em;
    overflow: hidden;
    position: relative;
    clip-path: inset(0);
}

.ticker-char {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1.2em;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: pre;
}
</style>
