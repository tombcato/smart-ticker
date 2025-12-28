import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Library build configuration
export default defineConfig({
    plugins: [
        react(),
        vue(),
        dts({
            include: ['src/index.ts', 'src/vue.ts', 'src/core/**', 'src/components/**'],
            outDir: 'dist',
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                vue: resolve(__dirname, 'src/vue.ts'),
            },
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => {
                const ext = format === 'es' ? 'js' : 'cjs';
                return `${entryName}.${ext}`;
            },
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime', 'vue'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    vue: 'Vue',
                },
            },
        },
        sourcemap: true,
        minify: false, // Keep readable for debugging
    },
});
