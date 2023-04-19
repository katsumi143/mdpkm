import svgr from 'vite-plugin-svgr';
import Icons from 'unplugin-icons/vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import { tauri } from 'vite-plugin-tauri';
import * as child from 'child_process';
import AutoImport from 'unplugin-auto-import/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { repository } from './package.json';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		outDir: 'build',
		target: 'esnext'
	},
	define: {
		GIT_BRANCH: JSON.stringify(child.execSync('git branch --show-current').toString().trimEnd()),
		GIT_REPOSITORY: JSON.stringify(repository.split(':')[1]),
		GIT_COMMIT_HASH: JSON.stringify(child.execSync('git rev-parse --short HEAD').toString().trimEnd())
	},
	server: {
		fs: { strict: false },
		hmr: {
			overlay: false
		},
		open: false
	},
	plugins: [
		svgr({
			svgrOptions: {
				svgProps: {
					width: '1em',
					height: '1em',
					fontSize: '16px'
				}
			}
		}),
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
			scale: 1,
			compiler: 'jsx',
			iconCustomizer(collection, icon, props) {
				props.fontSize = '16px';
			}
		}),
		tauri(),
		{
			name: 'base64-loader',
			transform(_,id) {
				const [path, query] = id.split('?');
				if (query !== 'raw-base64')
					return null;
				return `export default '${fs.readFileSync(path).toString('base64')}';`;
			}
		}
	],
	esbuild: { keepNames: true },
	clearScreen: true
});