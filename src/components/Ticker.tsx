/**
 * Ticker - 直接翻译自 Robinhood Android Ticker
 * https://github.com/robinhood/ticker
 */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import './Ticker.css';
import {
    TickerUtils,
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
} from '../core/TickerCore';

// 导出 Utils 供外部使用
export { TickerUtils };

// ============================================================================
// Ticker Component
// ============================================================================
export interface TickerProps {
    value: string;
    characterLists?: string[];
    duration?: number;
    direction?: ScrollingDirection;
    easing?: string;
    className?: string;
    charWidth?: number;
}

export const Ticker: React.FC<TickerProps> = ({
    value,
    characterLists: charListStrings = [TickerUtils.provideNumberList()],
    duration = 500,
    direction = 'ANY',
    easing = 'easeInOut', // Robinhood 默认: AccelerateDecelerateInterpolator
    className = '',
    charWidth = 1,
}) => {
    const [columns, setColumns] = useState<ColumnState[]>([]);
    const [progress, setProgress] = useState(1);
    const animRef = useRef<number>();
    const colsRef = useRef<ColumnState[]>([]);
    const progressRef = useRef(1);
    const isFirstRef = useRef(true);
    const prevValueRef = useRef('');

    const lists = useMemo(() => charListStrings.map(s => new TickerCharacterList(s)), [charListStrings]);
    const supported = useMemo(() => {
        const set = new Set<string>();
        lists.forEach(l => l.getSupportedCharacters().forEach(c => set.add(c)));
        return set;
    }, [lists]);

    // 用 ref 存储依赖项，避免 useEffect 因为这些依赖重复触发
    const listsRef = useRef(lists);
    const supportedRef = useRef(supported);
    const directionRef = useRef(direction);
    const durationRef = useRef(duration);
    const easingRef = useRef(easing);
    listsRef.current = lists;
    supportedRef.current = supported;
    directionRef.current = direction;
    durationRef.current = duration;
    easingRef.current = easing;

    // 主要逻辑：value 变化时处理
    useEffect(() => {
        // 防止相同 value 重复触发（React StrictMode）
        if (value === prevValueRef.current) {
            return;
        }
        prevValueRef.current = value;

        // 取消正在进行的动画
        if (animRef.current) {
            cancelAnimationFrame(animRef.current);
            animRef.current = undefined;
        }

        // 如果动画进行中，先用当前进度更新列状态
        let currentCols = colsRef.current;
        if (progressRef.current < 1 && progressRef.current > 0) {
            currentCols = currentCols.map(c => applyProgress(c, progressRef.current, true).col);
            colsRef.current = currentCols;
        }

        const targetChars = value.split('');
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

        // 动画
        if (!isFirstRef.current && result.length > 0) {
            progressRef.current = 0;
            setProgress(0);
            const start = performance.now();
            const dur = durationRef.current;
            const easeFn = easingFunctions[easingRef.current] || easingFunctions.linear;
            let lastUpdate = 0;

            const animate = (now: number) => {
                const linearP = Math.min((now - start) / dur, 1);
                const p = easeFn(linearP); // 应用 easing 函数
                progressRef.current = p;

                // 节流：每 16ms 最多更新一次视图 (约 60fps)
                if (now - lastUpdate >= 16 || linearP >= 1) {
                    lastUpdate = now;
                    setProgress(p);
                }

                if (linearP < 1) {
                    animRef.current = requestAnimationFrame(animate);
                } else {
                    // 动画结束
                    const final = colsRef.current
                        .map(c => applyProgress(c, 1).col)
                        .filter(c => c.currentWidth > 0);
                    colsRef.current = final;
                    setColumns(final);
                    animRef.current = undefined;
                }
            };
            animRef.current = requestAnimationFrame(animate);
        } else {
            // 首次渲染，直接显示
            isFirstRef.current = false;
            progressRef.current = 1;
            setProgress(1);
            const final = result.map(c => applyProgress(c, 1).col).filter(c => c.currentWidth > 0);
            colsRef.current = final;
            setColumns(final);
        }

        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [value]); // 只依赖 value

    // 渲染
    const charHeight = 1.2; // 与 CSS line-height 匹配

    const rendered = useMemo(() => {
        return columns.map((col, i) => {
            const { charIdx, delta } = applyProgress(col, progress);
            const width = col.sourceWidth + (col.targetWidth - col.sourceWidth) * progress;
            if (width <= 0) return null;

            const chars: React.ReactNode[] = [];
            const list = col.charList || [];
            const deltaEm = delta * charHeight;

            // 当前字符
            if (charIdx >= 0 && charIdx < list.length) {
                chars.push(
                    <div key={`c-${charIdx}`} className="ticker-char" style={{ transform: `translateY(${deltaEm}em)` }}>
                        {list[charIdx] === EMPTY_CHAR ? '\u00A0' : list[charIdx]}
                    </div>
                );
            }
            // 下一个字符
            const nextIdx = charIdx + 1;
            if (nextIdx >= 0 && nextIdx < list.length) {
                chars.push(
                    <div key={`n-${nextIdx}`} className="ticker-char" style={{ transform: `translateY(${deltaEm - charHeight}em)` }}>
                        {list[nextIdx] === EMPTY_CHAR ? '\u00A0' : list[nextIdx]}
                    </div>
                );
            }
            // 上一个字符（处理中断）
            const prevIdx = charIdx - 1;
            if (prevIdx >= 0 && prevIdx < list.length) {
                chars.push(
                    <div key={`p-${prevIdx}`} className="ticker-char" style={{ transform: `translateY(${deltaEm + charHeight}em)` }}>
                        {list[prevIdx] === EMPTY_CHAR ? '\u00A0' : list[prevIdx]}
                    </div>
                );
            }

            // 基准宽度 0.8em * 倍率
            return (
                <div key={i} className="ticker-column" style={{ width: `${width * 0.8 * charWidth}em` }}>
                    {chars}
                </div>
            );
        });
    }, [columns, progress, charWidth]);

    return <div className={`ticker ${className}`.trim()}>{rendered}</div>;
};

export default React.memo(Ticker);
