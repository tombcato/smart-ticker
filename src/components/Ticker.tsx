/**
 * Ticker - 直接翻译自 Robinhood Android Ticker
 * https://github.com/robinhood/ticker
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import './Ticker.css';
import {
    Presets,
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
    // Helpers
    TickerConstants,
    getW,
} from '../core/TickerCore';

// 导出 Presets 供外部使用
export { Presets };

// 全角字符检测（提取到组件外避免每帧重复创建函数）


// ============================================================================
// Ticker Component
// ============================================================================
export interface TickerProps {
    value: string | number;
    numberFormat?: Intl.NumberFormat;
    characterLists?: string | string[];
    duration?: number;
    direction?: ScrollingDirection;
    easing?: EasingName | ((t: number) => number);
    className?: string;
    charWidth?: number;
    animateOnMount?: boolean;
    disableAnimation?: boolean;
    prefix?: string;
    suffix?: string;
    autoScale?: boolean;
    minScale?: number;
    fadingEdge?: boolean;
    onAnimationEnd?: () => void;
}

// Hook to detect reduced motion preference
const useReducedMotion = () => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setMatches(mediaQuery.matches);
        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    }, []);
    return matches;
};

export const Ticker: React.FC<TickerProps> = ({
    value,
    numberFormat,
    characterLists: charListStringsProp = Presets.NUMBER,
    duration = TickerConstants.DEFAULT_DURATION,
    direction = 'ANY',
    easing = 'easeInOut',
    className = '',
    charWidth = 1,
    animateOnMount = false,
    disableAnimation = false,
    prefix,
    suffix,
    autoScale = false,
    minScale = TickerConstants.DEFAULT_MIN_SCALE,
    fadingEdge = false,
    onAnimationEnd,
}) => {
    // 1. Reduced Motion
    const prefersReducedMotion = useReducedMotion();
    const shouldDisableAnimation = disableAnimation || prefersReducedMotion;
    const shouldDisableAnimationRef = useRef(shouldDisableAnimation);

    // Sync ref
    useEffect(() => {
        shouldDisableAnimationRef.current = shouldDisableAnimation;
    }, [shouldDisableAnimation]);

    // 2. Computed Values (Memo)
    const displayValue = useMemo(() => {
        if (typeof value === 'number') {
            if (numberFormat) {
                return numberFormat.format(value);
            }
            return value.toString();
        }
        return value;
    }, [value, numberFormat]);

    // Normalize characterLists to array
    const charListStrings = useMemo(() =>
        Array.isArray(charListStringsProp) ? charListStringsProp : [charListStringsProp],
        [charListStringsProp]
    );
    const lists = useMemo(() => charListStrings.map(s => new TickerCharacterList(s)), [charListStrings]);
    const supported = useMemo(() => {
        const set = new Set<string>();
        lists.forEach(l => l.getSupportedCharacters().forEach(c => set.add(c)));
        return set;
    }, [lists]);

    // Normalize characterLists helper
    const getLists = (prop: string | string[]) =>
        (Array.isArray(prop) ? prop : [prop]).map(s => new TickerCharacterList(s));

    // 3. Initialize State (SSR Compatible) - Calculate Full Columns for initial value
    const [columns, setColumns] = useState<ColumnState[]>(() => {
        // Initial sync render avoids blank first frame
        const targetChars = [...displayValue];
        const initialLists = getLists(charListStringsProp);
        return targetChars.map(char => {
            const col = setTarget(createColumn(), char, initialLists, direction);
            return applyProgress(col, 1).col; // Snap to target immediately
        });
    });

    const [progress, setProgress] = useState(1);

    // Refs
    const animRef = useRef<number>();
    const colsRef = useRef<ColumnState[]>(columns); // Initialize with state
    const progressRef = useRef(1);
    const isFirstRef = useRef(true);
    const prevValueRef = useRef(displayValue); // Initialize with current value to avoid immediate re-trigger? 
    // Wait, if I initialize prevValueRef to displayValue, the useEffect for animation might NOT trigger on mount?
    // If animateOnMount is TRUE, we WANT it to trigger.
    // If animateOnMount is FALSE, we DON'T want it to trigger (since we already rendered it).
    // So usually prevValueRef starts empty? No, if we rendered it, `prevValue` IS `displayValue`.

    // Logic for animateOnMount:
    // If animateOnMount=true, we fake prevValueRef to empty? 
    // But we rendered full. 
    // If we want to animate, we must differentiate.
    // Getting strict:
    // User wants SSR fix (static).
    // So default: prevValueRef = displayValue.

    // Refs for dependencies
    const listsRef = useRef(lists);
    const supportedRef = useRef(supported);
    const directionRef = useRef(direction);
    const durationRef = useRef(duration);
    const easingRef = useRef(easing);
    const onAnimationEndRef = useRef(onAnimationEnd);

    listsRef.current = lists;
    supportedRef.current = supported;
    directionRef.current = direction;
    durationRef.current = duration;
    easingRef.current = easing;
    onAnimationEndRef.current = onAnimationEnd;



    // Animation Effect
    useEffect(() => {
        // If animateOnMount is true and it's first run...
        // But we initialized prevValueRef to displayValue? 
        // Let's refine prevValueRef initialization.
        // If animateOnMount is true, we ideally want to detect "start" as empty.
        // But we constrained ourselves to SSR full render.
        // So animateOnMount might be tricky.
        // Use `isFirstRef` to handle this?

        const isFirst = isFirstRef.current;
        const valueChanged = displayValue !== prevValueRef.current;

        // Skip if nothing changed AND it's not the first run (or if no animation on mount requested)
        if (!isFirst && !valueChanged) {
            return;
        }

        // Logic for first run:
        // By default, we skip the animation IF it's the first run AND the value is the same as mount.
        // But if the value has ALREADY changed since mount, we MUST proceed to sync and animate.
        if (isFirst) {
            isFirstRef.current = false;
            if (!animateOnMount && !valueChanged) {
                return;
            }
        }

        prevValueRef.current = displayValue;
        const shouldAnimate = !shouldDisableAnimationRef.current;

        // Cancel existing
        if (animRef.current) {
            cancelAnimationFrame(animRef.current);
            animRef.current = undefined;
        }

        // Prepare for animation
        // If isFirst and animateOnMount:
        // Source should be empty? Or derived from "oldValue" which is... empty string?
        // But colsRef is full.
        // We need to Force Source to be Empty columns if animateOnMount && isFirst.

        let currentCols = colsRef.current;

        // Special case: Animate on Mount with SSR data present
        // We rendered Full. Now we want to animate Empty -> Full.
        // This causes hydration mismatch visual jump.
        // But we will proceed.
        if (isFirst && animateOnMount) {
            currentCols = []; // Start from empty?
            // Note: This effectively discards the "Full" layout we just rendered and starts from scratch.
        } else if (progressRef.current < 1 && progressRef.current > 0) {
            // Interrupted
            currentCols = currentCols.map(c => applyProgress(c, progressRef.current, true).col);
        }

        const targetChars = [...displayValue];
        const sourceChars = currentCols.map(c => c.currentChar);
        const actions = computeColumnActions(sourceChars, targetChars, supportedRef.current);

        let ci = 0, ti = 0;
        const result: ColumnState[] = [];
        const validCols = currentCols.filter(c => c.currentWidth > 0);

        for (const action of actions) {
            if (action === ACTION_INSERT) {
                result.push(setTarget(createColumn(), targetChars[ti++], listsRef.current, directionRef.current));
            } else if (action === ACTION_SAME) {
                const existing = validCols[ci++] || createColumn();
                result.push(setTarget(existing, targetChars[ti++], listsRef.current, directionRef.current));
            } else {
                const existing = validCols[ci++] || createColumn();
                result.push(setTarget(existing, EMPTY_CHAR, listsRef.current, directionRef.current));
            }
        }

        colsRef.current = result;
        setColumns(result);

        // Trigger Animation
        if (shouldAnimate && result.length > 0) {
            progressRef.current = 0;
            setProgress(0);
            const start = performance.now();
            const dur = durationRef.current;
            const easeFn = typeof easingRef.current === 'function'
                ? easingRef.current
                : easingFunctions[easingRef.current as EasingName] || easingFunctions.linear;
            let lastUpdate = 0;

            const animate = (now: number) => {
                const linearP = Math.min((now - start) / dur, 1);
                const p = easeFn(linearP);
                progressRef.current = p;

                if (now - lastUpdate >= 16 || linearP >= 1) {
                    lastUpdate = now;
                    setProgress(p);
                }

                if (linearP < 1) {
                    animRef.current = requestAnimationFrame(animate);
                } else {
                    const final = colsRef.current
                        .map(c => applyProgress(c, 1).col)
                        .filter(c => c.currentWidth > 0);
                    colsRef.current = final;
                    setColumns(final);
                    animRef.current = undefined;
                    onAnimationEndRef.current?.();
                }
            };
            animRef.current = requestAnimationFrame(animate);
        } else {
            // Immediate update (e.g. reduced motion or shouldDisableAnimation)
            // But wait, if initial load and no animation, we already have it?
            // Not if "shouldDisableAnimation" changed or logic path is different?
            // Actually, if !shouldAnimate, we just snap.

            // If isFirst, we already set initial state. But "result" might differ 
            // if we somehow had different logic? Unlikely.
            // But if we came here, we computed result.

            progressRef.current = 1;
            setProgress(1);
            const final = result.map(c => applyProgress(c, 1).col).filter(c => c.currentWidth > 0);
            colsRef.current = final;
            setColumns(final);
        }

        isFirstRef.current = false;

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [displayValue, animateOnMount]);
    // Dependency on animateOnMount is mostly for the initial run check keying

    // Filter rendered output...
    const charHeight = TickerConstants.CHAR_HEIGHT;

    const rendered = useMemo(() => {
        return columns.map((col, i) => {
            const { charIdx, delta } = applyProgress(col, progress);
            const width = col.sourceWidth + (col.targetWidth - col.sourceWidth) * progress;
            if (width <= 0) return null;

            const chars: React.ReactNode[] = [];
            const list = col.charList || [];
            const deltaEm = delta * charHeight;

            // Current
            if (charIdx >= 0 && charIdx < list.length) {
                chars.push(
                    <div key={`c-${charIdx}`} className="ticker-char" style={{ transform: `translateY(${deltaEm}em)` }}>
                        {list[charIdx] === EMPTY_CHAR ? '\u00A0' : list[charIdx]}
                    </div>
                );
            }
            // Next
            const nextIdx = charIdx + 1;
            if (nextIdx >= 0 && nextIdx < list.length) {
                chars.push(
                    <div key={`n-${nextIdx}`} className="ticker-char" style={{ transform: `translateY(${deltaEm - charHeight}em)` }}>
                        {list[nextIdx] === EMPTY_CHAR ? '\u00A0' : list[nextIdx]}
                    </div>
                );
            }
            // Previous
            const prevIdx = charIdx - 1;
            if (prevIdx >= 0 && prevIdx < list.length) {
                chars.push(
                    <div key={`p-${prevIdx}`} className="ticker-char" style={{ transform: `translateY(${deltaEm + charHeight}em)` }}>
                        {list[prevIdx] === EMPTY_CHAR ? '\u00A0' : list[prevIdx]}
                    </div>
                );
            }

            // Width calc
            const startChar = list[col.startIndex];
            const endChar = list[col.endIndex];
            const w1 = getW(startChar);
            const w2 = getW(endChar);
            const baseW = w1 + (w2 - w1) * progress;

            const isDeleting = col.targetWidth === 0 && col.sourceWidth > 0;
            const isInserting = col.sourceWidth === 0 && col.targetWidth > 0;
            const opacity = isDeleting ? 1 - progress : isInserting ? progress : 1;

            return (
                <div key={i} className="ticker-column" style={{
                    width: `${width * baseW * charWidth}em`,
                    opacity
                }}>
                    {chars}
                </div>
            );
        });
    }, [columns, progress, charWidth]);

    // Auto Scale Logic
    const tickerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const rafIdRef = useRef<number>();

    useEffect(() => {
        if (!autoScale || !tickerRef.current) {
            setScale(1);
            return;
        }
        const ticker = tickerRef.current;

        const performUpdate = () => {
            const container = ticker.parentElement;
            if (!container) return;

            // Calculate available width by subtracting sibling widths
            let siblingsWidth = 0;
            for (const child of container.children) {
                if (child !== ticker) {
                    siblingsWidth += (child as HTMLElement).offsetWidth || 0;
                }
            }
            const availableW = container.clientWidth - siblingsWidth;
            const contentW = ticker.scrollWidth;

            if (availableW > 0 && contentW > availableW) {
                setScale(Math.max(availableW / contentW, minScale));
            } else {
                setScale(1);
            }
        };

        const update = () => {
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = requestAnimationFrame(performUpdate);
        };

        const ro = new ResizeObserver(update);
        ro.observe(ticker);
        if (ticker.parentElement) ro.observe(ticker.parentElement);
        update();
        return () => {
            ro.disconnect();
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        };
    }, [autoScale, minScale, displayValue, prefix, suffix]);

    return (
        <div
            ref={tickerRef}
            className={`ticker ${fadingEdge ? 'ticker-fading-edge' : ''} ${className}`.trim()}
            style={autoScale ? {
                flexShrink: 0,
                minWidth: 'max-content',
                ...(scale < 1 ? { zoom: scale } : {})
            } : undefined}
        >
            {/* Screen Reader Only: Full Text */}
            <span className="ticker-sr-only">
                {prefix}{displayValue}{suffix}
            </span>

            {/* Visual Layer: Hidden from AT */}
            <div aria-hidden="true" style={{ display: 'contents' }}>
                {prefix && <span className="ticker-prefix">{prefix}</span>}
                {rendered}
                {suffix && <span className="ticker-suffix">{suffix}</span>}
            </div>
        </div>
    );
};

export default React.memo(Ticker);
