// React Entry Point
export { Ticker, TickerUtils } from './components/Ticker';
export type { TickerProps } from './components/Ticker';

// Core utilities (framework-agnostic)
export {
    TickerCharacterList,
    easingFunctions,
    computeColumnActions,
    createColumn,
    setTarget,
    applyProgress,
    EMPTY_CHAR,
    ACTION_SAME,
    ACTION_INSERT,
    ACTION_DELETE,
} from './core/TickerCore';

export type {
    ScrollingDirection,
    ColumnState,
} from './core/TickerCore';
