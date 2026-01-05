// ============================================================================
// Constants
// ============================================================================
export const EMPTY_CHAR = '\0';

export const Presets = {
    NUMBER: '0123456789',
    ALPHABET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ALPHANUMERIC: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    // 常用货币字符：数字 + 标点 货币符号不穿滚动不加
    CURRENCY: '0123456789.,',
};

export type ScrollingDirection = 'ANY' | 'UP' | 'DOWN';

// ============================================================================
// Defaults & Helpers
// ============================================================================
export const TickerConstants = {
    CHAR_HEIGHT: 1.2, // em
    DEFAULT_DURATION: 500, // ms
    DEFAULT_MIN_SCALE: 0.1,
    FW_RATIO: 1.25, // 中文字符宽度1.25em
    HW_RATIO: 0.75, // 英文字符宽度0.75em
};

// Check if character is full-width (CJK, Emoji, etc.)
export const isFW = (c: string): boolean => {
    if (!c || c.length === 0) return false;
    const code = c.codePointAt(0) || 0;
    return (
        (code >= 0x3000 && code <= 0x9FFF) ||  // CJK 标点 + 汉字
        (code >= 0xAC00 && code <= 0xD7AF) ||  // 韩文
        (code >= 0xFF00 && code <= 0xFFEF) ||  // 全角 ASCII
        (code >= 0x1F300 && code <= 0x1FAFF)   // Emoji 范围
    );
};

export const getW = (c: string): number => isFW(c) ? TickerConstants.FW_RATIO : TickerConstants.HW_RATIO;

// ============================================================================
// TickerCharacterList
// ============================================================================
export class TickerCharacterList {
    private numOriginalCharacters: number;
    private characterList: string[];
    private characterIndicesMap: Map<string, number>;

    constructor(characterList: string) {
        const charsArray = [...characterList];
        const length = charsArray.length;
        this.numOriginalCharacters = length;
        this.characterIndicesMap = new Map();

        for (let i = 0; i < length; i++) {
            this.characterIndicesMap.set(charsArray[i], i);
        }

        this.characterList = new Array(length * 2 + 1);
        this.characterList[0] = EMPTY_CHAR;
        for (let i = 0; i < length; i++) {
            this.characterList[1 + i] = charsArray[i];
            this.characterList[1 + length + i] = charsArray[i];
        }
    }

    getCharacterIndices(
        start: string,
        end: string,
        direction: ScrollingDirection
    ): { startIndex: number; endIndex: number } | null {
        let startIndex = this.getIndexOfChar(start);
        let endIndex = this.getIndexOfChar(end);

        if (startIndex < 0 || endIndex < 0) return null;

        switch (direction) {
            case 'DOWN':
                if (end === EMPTY_CHAR) {
                    endIndex = this.characterList.length;
                } else if (endIndex < startIndex) {
                    endIndex += this.numOriginalCharacters;
                }
                break;
            case 'UP':
                if (startIndex < endIndex) {
                    startIndex += this.numOriginalCharacters;
                }
                break;
            case 'ANY':
                if (start !== EMPTY_CHAR && end !== EMPTY_CHAR) {
                    if (endIndex < startIndex) {
                        const nonWrap = startIndex - endIndex;
                        const wrap = this.numOriginalCharacters - startIndex + endIndex;
                        if (wrap < nonWrap) endIndex += this.numOriginalCharacters;
                    } else if (startIndex < endIndex) {
                        const nonWrap = endIndex - startIndex;
                        const wrap = this.numOriginalCharacters - endIndex + startIndex;
                        if (wrap < nonWrap) startIndex += this.numOriginalCharacters;
                    }
                }
                break;
        }
        return { startIndex, endIndex };
    }

    getSupportedCharacters(): Set<string> {
        return new Set(this.characterIndicesMap.keys());
    }

    getCharacterList(): string[] {
        return this.characterList;
    }

    private getIndexOfChar(c: string): number {
        if (c === EMPTY_CHAR) return 0;
        if (this.characterIndicesMap.has(c)) return this.characterIndicesMap.get(c)! + 1;
        return -1;
    }
}

// ============================================================================
// Levenshtein
// ============================================================================
export const ACTION_SAME = 0;
export const ACTION_INSERT = 1;
export const ACTION_DELETE = 2;

export function computeColumnActions(source: string[], target: string[], supported: Set<string>): number[] {
    let si = 0, ti = 0;
    const actions: number[] = [];

    while (true) {
        const endS = si === source.length;
        const endT = ti === target.length;
        if (endS && endT) break;
        if (endS) { for (; ti < target.length; ti++) actions.push(ACTION_INSERT); break; }
        if (endT) { for (; si < source.length; si++) actions.push(ACTION_DELETE); break; }

        const sSupp = supported.has(source[si]);
        const tSupp = supported.has(target[ti]);

        if (sSupp && tSupp) {
            let se = si + 1, te = ti + 1;
            while (se < source.length && supported.has(source[se])) se++;
            while (te < target.length && supported.has(target[te])) te++;

            const sLen = se - si, tLen = te - ti;
            if (sLen === tLen) {
                for (let i = 0; i < sLen; i++) actions.push(ACTION_SAME);
            } else {
                const matrix: number[][] = Array(sLen + 1).fill(null).map(() => Array(tLen + 1).fill(0));
                for (let i = 0; i <= sLen; i++) matrix[i][0] = i;
                for (let j = 0; j <= tLen; j++) matrix[0][j] = j;
                for (let r = 1; r <= sLen; r++) {
                    for (let c = 1; c <= tLen; c++) {
                        const cost = source[si + r - 1] === target[ti + c - 1] ? 0 : 1;
                        matrix[r][c] = Math.min(matrix[r - 1][c] + 1, matrix[r][c - 1] + 1, matrix[r - 1][c - 1] + cost);
                    }
                }
                const result: number[] = [];
                let r = sLen, c = tLen;
                while (r > 0 || c > 0) {
                    if (r === 0) { result.push(ACTION_INSERT); c--; }
                    else if (c === 0) { result.push(ACTION_DELETE); r--; }
                    else {
                        const ins = matrix[r][c - 1], del = matrix[r - 1][c], rep = matrix[r - 1][c - 1];
                        if (ins < del && ins < rep) { result.push(ACTION_INSERT); c--; }
                        else if (del < rep) { result.push(ACTION_DELETE); r--; }
                        else { result.push(ACTION_SAME); r--; c--; }
                    }
                }
                for (let i = result.length - 1; i >= 0; i--) actions.push(result[i]);
            }
            si = se; ti = te;
        } else if (sSupp) { actions.push(ACTION_INSERT); ti++; }
        else if (tSupp) { actions.push(ACTION_DELETE); si++; }
        else { actions.push(ACTION_SAME); si++; ti++; }
    }
    return actions;
}

// ============================================================================
// Column State
// ============================================================================
export interface ColumnState {
    currentChar: string;
    targetChar: string;
    charList: string[] | null;
    startIndex: number;
    endIndex: number;
    sourceWidth: number;
    currentWidth: number;
    targetWidth: number;
    directionAdj: number;
    prevDelta: number;
    currDelta: number;
}

export function createColumn(): ColumnState {
    return {
        currentChar: EMPTY_CHAR, targetChar: EMPTY_CHAR, charList: null,
        startIndex: 0, endIndex: 0, sourceWidth: 0, currentWidth: 0, targetWidth: 0,
        directionAdj: 1, prevDelta: 0, currDelta: 0,
    };
}

export function setTarget(col: ColumnState, target: string, lists: TickerCharacterList[], dir: ScrollingDirection): ColumnState {
    const c = { ...col };
    c.targetChar = target;
    c.sourceWidth = c.currentWidth;
    c.targetWidth = target === EMPTY_CHAR ? 0 : 1;

    let found = false;
    for (const list of lists) {
        const indices = list.getCharacterIndices(c.currentChar, target, dir);
        if (indices) {
            c.charList = list.getCharacterList();
            c.startIndex = indices.startIndex;
            c.endIndex = indices.endIndex;
            found = true;
            break;
        }
    }
    if (!found) {
        c.charList = c.currentChar === target ? [c.currentChar] : [c.currentChar, target];
        c.startIndex = 0;
        c.endIndex = c.currentChar === target ? 0 : 1;
    }

    c.directionAdj = c.endIndex >= c.startIndex ? 1 : -1;
    c.prevDelta = c.currDelta;
    c.currDelta = 0;
    return c;
}

export function applyProgress(col: ColumnState, progress: number, forceUpdate = false): { col: ColumnState; charIdx: number; delta: number } {
    const c = { ...col };
    const total = Math.abs(c.endIndex - c.startIndex);
    const pos = progress * total;
    const offset = pos - Math.floor(pos);
    const additional = c.prevDelta * (1 - progress);
    const delta = offset * c.directionAdj + additional;
    const charIdx = c.startIndex + Math.floor(pos) * c.directionAdj;

    if (progress >= 1) {
        c.currentChar = c.targetChar;
        c.currDelta = 0;
        c.prevDelta = 0;
    } else if (forceUpdate && c.charList && charIdx >= 0 && charIdx < c.charList.length) {
        c.currentChar = c.charList[charIdx];
        c.currDelta = delta;
    }

    c.currentWidth = c.sourceWidth + (c.targetWidth - c.sourceWidth) * progress;
    return { col: c, charIdx, delta };
}

// ============================================================================
// Easing Functions
// ============================================================================
export type EasingName = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'easeOutCubic' | 'easeOutExpo' | 'backOut';

export const easingFunctions: Record<EasingName, (t: number) => number> = {
    linear: (t) => t,
    easeIn: (t) => t * t,
    easeOut: (t) => 1 - (1 - t) * (1 - t),
    easeInOut: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    bounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
    easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
    easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    backOut: (t) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    },
};
