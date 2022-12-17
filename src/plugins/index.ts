import React from 'react';
import i18next from 'i18next';
import * as xml from 'xmlbuilder2';
import * as http from '@tauri-apps/api/http';
import { encode } from 'js-base64';
import * as reacti18n from 'react-i18next';
import { readDir, createDir, readTextFile } from '@tauri-apps/api/fs';

import Plugin from './plugin';
import Patcher from './patcher';
import * as Util from '../util';
import * as mdpkm from '../mdpkm';
import { APP_DIR } from '../util/constants';
import * as Voxura from '../voxura';
import * as Voxeliface from 'voxeliface';

// For plugin developers:
// https://docs.mdpkm.voxelified.com/docs/category/plugin-api
export interface PluginManifest {
    id: string,
    name: string,
    version: string
};
interface PluginModule {
    default: any,
    manifest: PluginManifest
};
export default class PluginSystem {
    static path = `${APP_DIR}/plugins`;
    static loaded: Record<string, Plugin> = {};
    static async init() {
        await this.loadPlugins();
    }

    static async loadPlugins() {
        await createDir(this.path, { recursive: true });
        await this.loadDirectory(this.path);
    }

    static async loadPlugin(name: string, { default: PluginClass, manifest }: PluginModule) {
        if (this.loaded[manifest.id])
            throw new Error(`plugin has already been loaded.`);
        
        const plugin: Plugin = this.loaded[manifest.id] = new PluginClass(this);
        console.log(plugin);
        await plugin.init();

        Util.toast('Plugin loaded', `${name} loaded succesfully.`);
    }

    static async loadPluginFile(name: string, path: string) {
        const code = await readTextFile(path);
        const module = await import(/* @vite-ignore */ `data:text/javascript;base64,${encode(code)}`);
        const { manifest } = module;
        console.log(module);
        if (manifest && (manifest.id ?? manifest.name)) {
            await this.loadPlugin(name, module);
        } else
            throw new Error('Invalid Manifest');
    }

    static async loadDirectory(dir: string) {
        const files = await readDir(dir);
        for (const { name, path, children } of files)
            if (name && !children && name.endsWith('.plugin.js'))
                await this.loadPluginFile(name, path).catch(err => {
                    console.warn(err);
                    Util.toast('Unknown plugin error', `${name} failed to load.`)
                });
    }
};

(globalThis as any).__mdpkm__ = {
    xml,
    Util,
    http,
    mdpkm,
    React,
    Plugin,
    Voxura,
    i18next,
    Patcher,
    reacti18n,
    Voxeliface,
    PluginSystem
};