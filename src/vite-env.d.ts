/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module '*.svelte' {
    import type { ComponentType, SvelteComponent } from 'svelte'
    const component: ComponentType<SvelteComponent>
    export default component
}
