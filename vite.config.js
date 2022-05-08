import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compress from 'vite-plugin-compress';

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
        compress()
    ]
});