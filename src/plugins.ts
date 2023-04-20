import React from 'react';
import i18next from 'i18next';
import { encode } from 'js-base64';
import * as ReactDOM from 'react-dom';
import * as TauriAPI from '@tauri-apps/api';
import * as Reacti18n from 'react-i18next';
import { readDir, createDir, readTextFile } from '@tauri-apps/api/fs';

import Store from './store';
import * as Util from './util';
import * as mdpkm from './mdpkm';
import * as Enums from './enums';
import { APP_DIR } from './util/constants';
import * as Voxura from '../voxura';
import * as Constants from './util/constants';
import * as Voxeliface from 'voxeliface';
import InstanceCreators from './mdpkm/instance-creator';

// For plugin developers:
// https://docs.mdpkm.voxelified.com/docs/category/plugin-api
export interface Plugin {
	readonly id: string
	readonly icon?: string
	readonly version: string

	init(): void
}
export interface PluginManifest {
    id: string
    name: string
    version: string
}
export interface PluginModule {
    default: any
    manifest: PluginManifest
}

export const PLUGINS_DIR = `${APP_DIR}/plugins`;
export const LOADED_PLUGINS: Record<string, Plugin> = {};
export async function loadAllPlugins() {
	await createDir(PLUGINS_DIR, { recursive: true });
	for (const { name, path, children } of await readDir(PLUGINS_DIR))
		if (name && !children && name.endsWith('.plugin.js'))
			await loadPluginFromFile(path).catch(err => {
				Util.toast('plugin_load_fail', [name]);
				console.error(err);
			});
}

export async function loadPlugin({ default: PluginClass, manifest }: PluginModule) {
	if (LOADED_PLUGINS[manifest.id])
		throw new Error(`already loaded`);
	
	const plugin: Plugin = LOADED_PLUGINS[manifest.id] = new PluginClass();
	await plugin.init();

	Util.toast('plugin_loaded', [plugin.id]);
}

export async function loadPluginFromFile(path: string) {
	const code = await readTextFile(path);
	const module = await import(/* @vite-ignore */ `data:text/javascript;base64,${encode(code)}`);
	const { manifest } = module;
	if (manifest && (manifest.id ?? manifest.name))
		await loadPlugin(module);
	else
		throw new Error('invalid plugin manifest');
}

const global = globalThis as any;
global.Util = Util;
global.Store = Store;
global.mdpkm = mdpkm;
global.Enums = Enums;
global.React = React;
global.Voxura = Voxura;
global.i18next = i18next;
global.ReactDOM = ReactDOM;
global.TauriAPI = TauriAPI;
global.Reacti18n = Reacti18n;
global.Constants = Constants;
global.Voxeliface = Voxeliface;
global.InstanceCreators = InstanceCreators;