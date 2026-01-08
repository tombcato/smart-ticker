/**
 * Smart Ticker
 * High-Performance Text Diff Motion Component. Make your text flow like water
 */
import React, { useEffect, useRef, useState, useMemo, useLayoutEffect } from 'react';

// Use useLayoutEffect in browser to prevent flicker, useEffect in SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
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

export { Presets };




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

    const prefersReducedMotion = useReducedMotion();
    const shouldDisableAnimation = disableAnimation || prefersReducedMotion;
    const shouldDisableAnimationRef = useRef(shouldDisableAnimation);


    const displayValue = useMemo(() => {
        if (typeof value === 'number') {
            if (numberFormat) {
                return numberFormat.format(value);
            }
            return value.toString();
        }
        return value;
    }, [value, numberFormat]);

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

    const getLists = (prop: string | string[]) =>
        (Array.isArray(prop) ? prop : [prop]).map(s => new TickerCharacterList(s));

    // Initialize state with full value to prevent hydration mismatch
    const [columns, setColumns] = useState<ColumnState[]>(() => {
        const targetChars = [...displayValue];
        const initialLists = getLists(charListStringsProp);
        return targetChars.map(char => {
            const col = setTarget(createColumn(), char, initialLists, direction);
            return applyProgress(col, 1).col;
        });
    });

    const [progress, setProgress] = useState(1);

    const animRef = useRef<number>();
    const colsRef = useRef<ColumnState[]>(columns);
    const progressRef = useRef(1);
    const isFirstRef = useRef(true);
    const prevValueRef = useRef(displayValue);
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
    useIsomorphicLayoutEffect(() => {
        const isFirst = isFirstRef.current;
        const valueChanged = displayValue !== prevValueRef.current;
        // Resume animation if interrupted (Strict Mode)
        if (!isFirst && !valueChanged && progressRef.current === 1) {
            return;
        }

        if (isFirst) {
            isFirstRef.current = false;
            if (!animateOnMount && !valueChanged) return;
        }

        prevValueRef.current = displayValue;
        const shouldAnimate = !shouldDisableAnimationRef.current;

        // Cancel existing
        if (animRef.current) {
            cancelAnimationFrame(animRef.current);
            animRef.current = undefined;
        }

        // Prepare for animation
        let currentCols = colsRef.current;

        if (isFirst && animateOnMount) {
            // Start from empty if animating on mount
            currentCols = [];
        } else if (progressRef.current < 1 && progressRef.current > 0) {
            // Smoothly interrupted
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

        // Trigger Animation
        if (shouldAnimate && result.length > 0) {
            progressRef.current = 0;
            setProgress(0);
            setColumns(result);

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
