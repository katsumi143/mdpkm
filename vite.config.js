import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
        react()
    ]
});