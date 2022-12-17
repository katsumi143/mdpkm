import svgr from 'vite-plugin-svgr';
import Icons from 'unplugin-icons/vite';
import react from '@vitejs/plugin-react';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
    build: {
        outDir: 'build',
        target: 'esnext'
    },
    server: {
		fs: { strict: false },
        hmr: { overlay: false },
        open: false
    },
    plugins: [
        svgr(),
        react(),
        AutoImport({
            dts: true,
            resolvers: [
                IconsResolver({
                    prefix: 'Icon',
                    extension: 'jsx'
                })
            ]
        }),
        Icons({
            jsx: 'react',
            compiler: 'jsx'
        })
    ],
    esbuild: { keepNames: true },
    clearScreen: true
});