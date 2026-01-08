import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Library build configuration
export default defineConfig({
    plugins: [
        react(),
        vue(),
        svelte({
            compilerOptions: {
                // Svelte 4 compatibility
            },
        }),
        dts({
            include: ['src/vite-env.d.ts', 'src/index.ts', 'src/vue.ts', 'src/svelte.ts', 'src/core/**', 'src/components/**'],
            outDir: 'dist',
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                vue: resolve(__dirname, 'src/vue.ts'),
                svelte: resolve(__dirname, 'src/svelte.ts'),
            },
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => {
                const ext = format === 'es' ? 'js' : 'cjs';
                return `${entryName}.${ext}`;
            },
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'react/jsx-dev-runtime',
                'react-dom/client',
                /^react\/.*/,
                /^react-dom\/.*/,
                'vue',
                'svelte',
                'svelte/internal',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    vue: 'Vue',
                    svelte: 'Svelte',
                },
            },
        },
        sourcemap: true,
        minify: false, // Keep readable for debugging
    },
});
