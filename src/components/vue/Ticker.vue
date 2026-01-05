<template>
  <div 
    ref="tickerRef"
    :class="['ticker', { 'ticker-fading-edge': fadingEdge }]" 
    :style="autoScale ? { 
      flexShrink: 0,
      minWidth: 'max-content',
      ...(scale < 1 ? { zoom: scale } : {})
    } : undefined"
  >
    <span class="ticker-sr-only">{{ prefix }}{{ displayValue }}{{ suffix }}</span>
    <div aria-hidden="true" style="display: contents">
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
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted, onMounted, PropType, toRaw } from 'vue';
import {
    TickerCharacterList,
    Presets,
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
    // Helpers
    TickerConstants,
    getW,
} from '../../core/TickerCore';
import '../Ticker.css';

const props = withDefaults(defineProps<{
    value: string | number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    autoScale?: boolean;
    minScale?: number;
    disableAnimation?: boolean;
    animateOnMount?: boolean;
    characterLists?: string | string[];
    direction?: ScrollingDirection;
    charWidth?: number;
    easing?: EasingName | ((t: number) => number);
    numberFormat?: Intl.NumberFormat;
    fadingEdge?: boolean;
}>(), {
    duration: TickerConstants.DEFAULT_DURATION,
    autoScale: false,
    minScale: TickerConstants.DEFAULT_MIN_SCALE,
    disableAnimation: false,
    animateOnMount: false,
    characterLists: () => Presets.NUMBER,
    direction: 'ANY',
    charWidth: 1,
    easing: 'easeInOut',
    fadingEdge: false,
});

const emit = defineEmits<{
    (e: 'animationEnd'): void;
}>();

// Helpers from Core used directly


// Reduced Motion
const prefersReducedMotion = ref(false);
let mediaQuery: MediaQueryList | null = null;

const checkReducedMotion = () => {
    if (typeof window === 'undefined') return;
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = mediaQuery.matches;
    mediaQuery.addEventListener('change', (e) => prefersReducedMotion.value = e.matches);
};

// Computed
const displayValue = computed(() => {
    if (typeof props.value === 'number') {
        if (props.numberFormat) {
            return toRaw(props.numberFormat).format(props.value);
        }
        return props.value.toString();
    }
    return props.value;
});

const lists = computed(() => {
    const arr = Array.isArray(props.characterLists) ? props.characterLists : [props.characterLists];
    return arr.map(s => new TickerCharacterList(s));
});

const supported = computed(() => {
    const set = new Set<string>();
    lists.value.forEach(l => l.getSupportedCharacters().forEach(c => set.add(c)));
    return set;
});

// State
const columns = ref<ColumnState[]>([]);
const progress = ref(1);
let animId: number | undefined;
let isFirst = true;



const shouldDisableAnimation = computed(() => props.disableAnimation || prefersReducedMotion.value);

watch(displayValue, (newValue, oldValue) => {
    // If first run (immediate watcher), oldValue might be undefined or empty if we didn't init.
    // Actually immediate watcher has oldValue as undefined.
    if (newValue === oldValue) return;
    
    // Allow animation interruption
    if (animId) { 
        cancelAnimationFrame(animId); 
        animId = undefined; 
        
        // If interrupted, currentCols should be the current interpolated state
        // But we were mutating `columns.value` directly in the animation loop? No, via `applyProgress`.
        // Wait, applyProgress returns NEW column object.
        // But we weren't updating `columns.value` continuously in the loop except at end?
        // Let's check animation loop.
        // It updates `progress.value`. `renderedColumns` computed uses `progress.value`.
        // So `columns.value` itself is NOT mutated during animation.
        // Thus `currentCols` is still the 'start' state of the previous animation.
        // We need the ACTUAL current state (interpolated) as the new start.
        
        // Correction: if interrupted, we must calculate the intermediate state and make that the new start.
         const currentIntermediate = columns.value.map(c => applyProgress(c, progress.value, true).col);
         columns.value = currentIntermediate;
    }

    let currentCols = columns.value;
    // Also if progress < 1 but no animId (rare race?), treat as intermediate?
    // The previous logic was: if (progress.value < 1 && progress.value > 0) ...
    // Let's restore that check for robustness.
    if (progress.value < 1 && progress.value > 0) {
        currentCols = currentCols.map(c => applyProgress(c, progress.value, true).col);
        columns.value = currentCols;
    }

    const targetChars = newValue.split('');
    const sourceChars = currentCols.map(c => c.currentChar);
    const actions = computeColumnActions(sourceChars, targetChars, supported.value);

    let ci = 0, ti = 0;
    const result: ColumnState[] = [];
    const validCols = currentCols.filter(c => c.currentWidth > 0);

    actions.forEach(action => {
        if (action === ACTION_INSERT) {
            result.push(setTarget(createColumn(), targetChars[ti++], lists.value, props.direction));
        } else if (action === ACTION_SAME) {
            const existing = validCols[ci++] || createColumn();
            result.push(setTarget(existing, targetChars[ti++], lists.value, props.direction));
        } else {
            const existing = validCols[ci++] || createColumn();
            result.push(setTarget(existing, EMPTY_CHAR, lists.value, props.direction));
        }
    });

    columns.value = result;

    const shouldAnimate = !shouldDisableAnimation.value && (!isFirst || props.animateOnMount);
    
    if (shouldAnimate && result.length > 0) {
        progress.value = 0;
        const start = performance.now();
        const dur = props.duration;
        const easeFn = typeof props.easing === 'function' ? props.easing : (easingFunctions[props.easing as keyof typeof easingFunctions] || easingFunctions.linear);
        let lastUpdate = 0;

        const animate = (now: number) => {
            const linearP = Math.min((now - start) / dur, 1);
            const p = easeFn(linearP);
            progress.value = p;

            if (now - lastUpdate >= 16 || linearP >= 1) {
                lastUpdate = now;
            }

            if (linearP < 1) {
                animId = requestAnimationFrame(animate);
            } else {
                animId = undefined;
                progress.value = 1;
                const final = result.map(c => applyProgress(c, 1).col).filter(c => c.currentWidth > 0);
                columns.value = final;
                emit('animationEnd');
            }
        };
        animId = requestAnimationFrame(animate);
    } else {
        progress.value = 1;
        const final = result.map(c => applyProgress(c, 1).col).filter(c => c.currentWidth > 0);
        columns.value = final;
    }
    
    isFirst = false;
}, { immediate: true });

// Rendered columns calculation
// Rendered columns calculation
const charHeight = TickerConstants.CHAR_HEIGHT;
const renderedColumns = computed(() => {
    return columns.value.map(col => {
        const { charIdx, delta } = applyProgress(col, progress.value);
        const width = col.sourceWidth + (col.targetWidth - col.sourceWidth) * progress.value;
        if (width <= 0) return { width, chars: [] };

        const chars: Array<{ key: string, char: string, offset: number }> = [];
        const list = col.charList || [];
        const deltaEm = delta * charHeight;

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
        const endChar = list[col.endIndex] || '';
        const w1 = getW(startChar);
        const w2 = getW(endChar);
        const baseW = w1 + (w2 - w1) * progress.value;

        const isDeleting = col.targetWidth === 0 && col.sourceWidth > 0;
        const isInserting = col.sourceWidth === 0 && col.targetWidth > 0;
        const opacity = isDeleting ? 1 - progress.value : isInserting ? progress.value : 1;

        return { width, chars, baseW, opacity };
    }).filter(c => c.width > 0);
});


// Auto Scale
const tickerRef = ref<HTMLDivElement | null>(null);
const scale = ref(1);
let resizeObserver: ResizeObserver | null = null;
let rafId: number | undefined;

const performUpdateScale = () => {
    if (!props.autoScale || !tickerRef.value) {
        scale.value = 1;
        return;
    }
    const el = tickerRef.value;
    const parent = el.parentElement;
    if (!parent) return;

    // Calculate available width by subtracting sibling widths
    let siblingsWidth = 0;
    for (const child of parent.children) {
        if (child !== el) {
            siblingsWidth += (child as HTMLElement).offsetWidth || 0;
        }
    }
    
    const availableW = parent.clientWidth - siblingsWidth;
    const contentW = el.scrollWidth;

    if (availableW > 0 && contentW > availableW) {
        scale.value = Math.max(availableW / contentW, props.minScale);
    } else {
        scale.value = 1;
    }
};

const updateScale = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(performUpdateScale);
};

    onMounted(() => {
    checkReducedMotion();

    // Auto Scale logic
    watch(() => props.autoScale, (val) => {
        if (val) {
            // Enable
            if (!resizeObserver && tickerRef.value) {
                resizeObserver = new ResizeObserver(updateScale);
                resizeObserver.observe(tickerRef.value);
                if (tickerRef.value.parentElement) {
                    resizeObserver.observe(tickerRef.value.parentElement);
                }
            }
            // Trigger initial update
            updateScale();
        } else {
            // Disable
             if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }
            scale.value = 1;
        }
    }, { immediate: true });

    // React to value changes for Auto Scale
    watch([displayValue, () => props.prefix, () => props.suffix], () => {
        if (props.autoScale) {
             setTimeout(updateScale, 0);
        }
    });


});

onUnmounted(() => {
    if (mediaQuery) mediaQuery.removeEventListener('change', (e) => prefersReducedMotion.value = e.matches);
    if (animId) cancelAnimationFrame(animId);
    if (rafId) cancelAnimationFrame(rafId);
    if (resizeObserver) resizeObserver.disconnect();
});
</script>


