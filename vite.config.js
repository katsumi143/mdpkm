import svgr from "vite-plugin-svgr";
import Icons from 'unplugin-icons/vite';
import react from '@vitejs/plugin-react';
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
        }
    },
    plugins: [
        svgr(),
        react(),
        AutoImport({
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
		})
    ],
    esbuild: {
        keepNames: true
    }
});