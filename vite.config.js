import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import i18nHotReload from 'vite-plugin-i18n-hot-reload';

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
        react(),
        i18nHotReload({
			folder: 'src/localization/locales'
		})
    ]
});