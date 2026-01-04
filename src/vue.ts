// Vue Entry Point
export { default as Ticker } from './components/vue/Ticker.vue';

// Core utilities (framework-agnostic)
export {
    TickerCharacterList,
    TickerUtils,
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
    EasingName,
} from './core/TickerCore';
