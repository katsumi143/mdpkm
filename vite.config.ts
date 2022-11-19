import svgr from 'vite-plugin-svgr';
import Icons from 'unplugin-icons/vite';
import react from '@vitejs/plugin-react';
import { tauri } from 'vite-plugin-tauri';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import i18nHotReload from 'vite-plugin-i18n-hot-reload';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        outDir: 'build',
        target: 'esnext'
    },
    server: {
        hmr: {
            overlay: false
        },
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
        }),
        i18nHotReload({
			folder: 'src/localization/locales'
		}),
        tauri()
    ],
    esbuild: {
        keepNames: true
    },
    clearScreen: true
});