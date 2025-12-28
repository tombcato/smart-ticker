<template>
  <div class="ticker" :class="className">
    <div
      v-for="(col, i) in renderedColumns"
      :key="i"
      class="ticker-column"
      :style="{ width: `${col.width}em` }"
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
    ACTION_INSERT,
    ACTION_SAME,
    ACTION_DELETE,
} from '../../core/TickerCore';

// ============================================================================
// Vue Component Setup
// ============================================================================

const props = defineProps({
  value: { type: String, required: true },
  characterLists: { type: Array as () => string[], default: () => ['0123456789'] },
  duration: { type: Number, default: 500 },
  direction: { type: String as () => ScrollingDirection, default: 'ANY' },
  easing: { type: String, default: 'easeInOut' },
  className: { type: String, default: '' },
});

const columns = ref<ColumnState[]>([]);
const progress = ref(1);
let animId: number | undefined;

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

    const targetChars = newValue.split('');
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

    // Start Animation
    progress.value = 0;
    const start = performance.now();
    const dur = props.duration;
    const easeFn = easingFunctions[props.easing] || easingFunctions.linear;
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

        return { width, chars };
    }).filter(c => c.width > 0);
});

</script>

<style scoped>
.ticker {
    display: inline-flex;
    overflow: hidden;
    font-family: 'JetBrains Mono', monospace;
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
