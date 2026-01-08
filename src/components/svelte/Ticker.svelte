<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import {
        TickerCharacterList,
        Presets,
        type ScrollingDirection,
        type ColumnState,
        EMPTY_CHAR,
        computeColumnActions,
        createColumn,
        setTarget,
        applyProgress,
        easingFunctions,
        type EasingName,
        ACTION_INSERT,
        ACTION_SAME,
        TickerConstants,
        getW,
    } from '../../core/TickerCore';
    import '../Ticker.css';

    // Props
    export let value: string | number;
    export let duration: number = TickerConstants.DEFAULT_DURATION;
    export let prefix: string = '';
    export let suffix: string = '';
    export let autoScale: boolean = false;
    export let minScale: number = TickerConstants.DEFAULT_MIN_SCALE;
    export let disableAnimation: boolean = false;
    export let animateOnMount: boolean = false;
    export let characterLists: string | string[] = Presets.NUMBER;
    export let direction: ScrollingDirection = 'ANY';
    export let charWidth: number = 1;
    export let easing: EasingName | ((t: number) => number) = 'easeInOut';
    export let numberFormat: Intl.NumberFormat | undefined = undefined;
    export let fadingEdge: boolean = false;

    const dispatch = createEventDispatcher<{ animationend: void }>();

    // State
    let columns: ColumnState[] = [];
    let progress = 1;
    let animId: number | undefined;
    let isFirst = true;
    let tickerRef: HTMLDivElement;
    let scale = 1;
    let resizeObserver: ResizeObserver | null = null;
    let rafId: number | undefined;
    let prefersReducedMotion = false;
    let mediaQuery: MediaQueryList | null = null;

    // Computed
    $: displayValue = typeof value === 'number'
        ? (numberFormat ? numberFormat.format(value) : value.toString())
        : value;

    $: lists = (Array.isArray(characterLists) ? characterLists : [characterLists])
        .map(s => new TickerCharacterList(s));

    $: supported = (() => {
        const set = new Set<string>();
        lists.forEach(l => l.getSupportedCharacters().forEach(c => set.add(c)));
        return set;
    })();

    $: shouldDisableAnimation = disableAnimation || prefersReducedMotion;

    $: renderedColumns = columns.map(col => {
        const { charIdx, delta } = applyProgress(col, progress);
        const width = col.sourceWidth + (col.targetWidth - col.sourceWidth) * progress;
        if (width <= 0) return { width, chars: [], baseW: 0, opacity: 0 };

        const chars: Array<{ key: string; char: string; offset: number }> = [];
        const list = col.charList || [];
        const deltaEm = delta * TickerConstants.CHAR_HEIGHT;

        const add = (idx: number, offsetMod: number, keyPrefix: string) => {
            if (idx >= 0 && idx < list.length) {
                chars.push({
                    key: `${keyPrefix}-${idx}`,
                    char: list[idx],
                    offset: deltaEm + offsetMod,
                });
            }
        };

        add(charIdx, 0, 'c');
        add(charIdx + 1, -TickerConstants.CHAR_HEIGHT, 'n');
        add(charIdx - 1, TickerConstants.CHAR_HEIGHT, 'p');

        const startChar = list[col.startIndex] || '';
        const endChar = list[col.endIndex] || '';
        const w1 = getW(startChar);
        const w2 = getW(endChar);
        const baseW = w1 + (w2 - w1) * progress;

        const isDeleting = col.targetWidth === 0 && col.sourceWidth > 0;
        const isInserting = col.sourceWidth === 0 && col.targetWidth > 0;
        const opacity = isDeleting ? 1 - progress : isInserting ? progress : 1;

        return { width, chars, baseW, opacity };
    }).filter(c => c.width > 0);

    // Watch displayValue
    $: if (displayValue !== undefined) {
        handleValueChange(displayValue);
    }

    function handleValueChange(newValue: string) {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = undefined;
            const currentIntermediate = columns.map(c => applyProgress(c, progress, true).col);
            columns = currentIntermediate;
        }

        let currentCols = columns;
        if (progress < 1 && progress > 0) {
            currentCols = currentCols.map(c => applyProgress(c, progress, true).col);
            columns = currentCols;
        }

        const targetChars = [...newValue];
        const sourceChars = currentCols.map(c => c.currentChar);
        const actions = computeColumnActions(sourceChars, targetChars, supported);

        let ci = 0, ti = 0;
        const result: ColumnState[] = [];
        const validCols = currentCols.filter(c => c.currentWidth > 0);

        actions.forEach(action => {
            if (action === ACTION_INSERT) {
                result.push(setTarget(createColumn(), targetChars[ti++], lists, direction));
            } else if (action === ACTION_SAME) {
                const existing = validCols[ci++] || createColumn();
                result.push(setTarget(existing, targetChars[ti++], lists, direction));
            } else {
                const existing = validCols[ci++] || createColumn();
                result.push(setTarget(existing, EMPTY_CHAR, lists, direction));
            }
        });

        columns = result;

        const shouldAnimate = !shouldDisableAnimation && (!isFirst || animateOnMount);

        if (shouldAnimate && result.length > 0) {
            progress = 0;
            const start = performance.now();
            const dur = duration;
            const easeFn = typeof easing === 'function'
                ? easing
                : (easingFunctions[easing as keyof typeof easingFunctions] || easingFunctions.linear);

            const animate = (now: number) => {
                const linearP = Math.min((now - start) / dur, 1);
                const p = easeFn(linearP);
                progress = p;

                if (linearP < 1) {
                    animId = requestAnimationFrame(animate);
                } else {
                    animId = undefined;
                    progress = 1;
                    const final = result.map(c => applyProgress(c, 1).col).filter(c => c.currentWidth > 0);
                    columns = final;
                    dispatch('animationend');
                }
            };
            animId = requestAnimationFrame(animate);
        } else {
            progress = 1;
            const final = result.map(c => applyProgress(c, 1).col).filter(c => c.currentWidth > 0);
            columns = final;
        }

        isFirst = false;
    }

    // Auto Scale
    function performUpdateScale() {
        if (!autoScale || !tickerRef) {
            scale = 1;
            return;
        }
        const el = tickerRef;
        const parent = el.parentElement;
        if (!parent) return;

        let siblingsWidth = 0;
        for (const child of parent.children) {
            if (child !== el) {
                siblingsWidth += (child as HTMLElement).offsetWidth || 0;
            }
        }

        const availableW = parent.clientWidth - siblingsWidth;
        const contentW = el.scrollWidth;

        if (availableW > 0 && contentW > availableW) {
            scale = Math.max(availableW / contentW, minScale);
        } else {
            scale = 1;
        }
    }

    function updateScale() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(performUpdateScale);
    }

    $: if (autoScale && tickerRef) {
        updateScale();
    }

    onMount(() => {
        // Reduced motion check
        if (typeof window !== 'undefined') {
            mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            prefersReducedMotion = mediaQuery.matches;
            mediaQuery.addEventListener('change', (e) => prefersReducedMotion = e.matches);
        }

        // Auto scale observer
        if (autoScale && tickerRef) {
            resizeObserver = new ResizeObserver(updateScale);
            resizeObserver.observe(tickerRef);
            if (tickerRef.parentElement) {
                resizeObserver.observe(tickerRef.parentElement);
            }
            updateScale();
        }
    });

    onDestroy(() => {
        if (mediaQuery) mediaQuery.removeEventListener('change', () => {});
        if (animId) cancelAnimationFrame(animId);
        if (rafId) cancelAnimationFrame(rafId);
        if (resizeObserver) resizeObserver.disconnect();
    });
</script>

<div
    bind:this={tickerRef}
    class="ticker"
    class:ticker-fading-edge={fadingEdge}
    style={autoScale ? `flex-shrink: 0; min-width: max-content; ${scale < 1 ? `zoom: ${scale}` : ''}` : ''}
>
    <span class="ticker-sr-only">{prefix}{displayValue}{suffix}</span>
    <div aria-hidden="true" style="display: contents">
        {#if prefix}
            <span class="ticker-prefix">{prefix}</span>
        {/if}
        {#each renderedColumns as col, i (i)}
            <div
                class="ticker-column"
                style="width: {col.width * (col.baseW || 0.8) * charWidth}em; opacity: {col.opacity}"
            >
                {#each col.chars as charObj (charObj.key)}
                    <div
                        class="ticker-char"
                        style="transform: translateY({charObj.offset}em)"
                    >
                        {charObj.char === EMPTY_CHAR ? '\u00A0' : charObj.char}
                    </div>
                {/each}
            </div>
        {/each}
        {#if suffix}
            <span class="ticker-suffix">{suffix}</span>
        {/if}
    </div>
</div>
