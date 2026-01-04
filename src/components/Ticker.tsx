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
    EasingName,
    ACTION_INSERT,
    ACTION_SAME,
} from '../core/TickerCore';

// 导出 Utils 供外部使用
export { TickerUtils };

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
// Ticker Component
// ============================================================================
export interface TickerProps {
    value: string;
    characterLists?: string[];
    duration?: number;
    direction?: ScrollingDirection;
    easing?: EasingName | ((t: number) => number);
    className?: string;
    charWidth?: number;
    animateOnMount?: boolean;
    disabled?: boolean;
    prefix?: string;
    suffix?: string;
    onAnimationEnd?: () => void;
}

export const Ticker: React.FC<TickerProps> = ({
    value,
    characterLists: charListStrings = [TickerUtils.provideNumberList()],
    duration = 500,
    direction = 'ANY',
    easing = 'easeInOut',
    className = '',
    charWidth = 1,
    animateOnMount = false,
    disabled = false,
    prefix,
    suffix,
    onAnimationEnd,
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
    const disabledRef = useRef(disabled);
    const onAnimationEndRef = useRef(onAnimationEnd);
    listsRef.current = lists;
    supportedRef.current = supported;
    directionRef.current = direction;
    durationRef.current = duration;
    easingRef.current = easing;
    disabledRef.current = disabled;
    onAnimationEndRef.current = onAnimationEnd;

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

        const targetChars = [...value];
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

        // 动画：首次渲染时根据 animateOnMount 决定是否动画，disabled 跳过动画
        if (!disabledRef.current && (!isFirstRef.current || animateOnMount) && result.length > 0) {
            progressRef.current = 0;
            setProgress(0);
            const start = performance.now();
            const dur = durationRef.current;
            // 支持自定义 easing 函数
            const easeFn = typeof easingRef.current === 'function'
                ? easingRef.current
                : easingFunctions[easingRef.current as EasingName] || easingFunctions.linear;
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
                    // 触发 onAnimationEnd 回调
                    onAnimationEndRef.current?.();
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

            // 动态计算字符基础宽度

            // 安全获字符
            const startChar = list[col.startIndex];
            const endChar = list[col.endIndex];

            const w1 = getW(startChar);
            const w2 = getW(endChar);
            const baseW = w1 + (w2 - w1) * progress;

            // 新增/删除列时添加 alpha 渐变
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

    return (
        <div className={`ticker ${className}`.trim()}>
            {prefix && <span className="ticker-prefix">{prefix}</span>}
            {rendered}
            {suffix && <span className="ticker-suffix">{suffix}</span>}
        </div>
    );
};

export default React.memo(Ticker);
