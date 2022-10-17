import React from 'react';
import toast from 'react-hot-toast';
import i18next from 'i18next';
import * as xml from 'xmlbuilder2';
import * as http from '@tauri-apps/api/http';
import { encode } from 'js-base64';

import API from '../api';
import Util from '../util';
import Plugin from './plugin';
import Patcher from './patcher';
import * as voxura from '../voxura';
import PluginSystem from './system';
import * as PluginUtil from './util';
import * as Voxeliface from '../../../voxeliface';

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
export default class PluginLoader {
    static loaded = {};
    static async loadPlugin(name: string, path: string, { default: PluginClass, manifest }: PluginModule) {
        if (this.loaded[manifest.id])
            throw new Error(`plugin has already been loaded.`);
        
        const plugin: Plugin = this.loaded[manifest.id] = new PluginClass(this);
        console.log(plugin);
        await plugin.init();

        toast.success(`'${name}' has loaded.`);
    }

    static async loadPluginFile(name: string, path: string) {
        const code = await Util.readTextFile(path);
        const module = await import(/* @vite-ignore */`data:text/javascript;base64,${encode(code)}`);
        const { manifest } = module;
        console.log(module);
        if (manifest && (manifest.id ?? manifest.name)) {
            await this.loadPlugin(name, path, module);
        } else
            throw new Error('Invalid Manifest');
    }

    static async loadDirectory(dir: string) {
        const files = await Util.readDir(dir);
        for (const { name, path, isDir } of files)
            try {
                if (!isDir && name.endsWith('.plugin.js'))
                    await this.loadPluginFile(name, path);
            } catch(err) {
                console.warn(err);
                toast.error(`'${name}' failed to load.\n${err.message}`);
            }
    }
};

globalThis.__mdpkm__ = {
    xml,
    API,
    Util,
    http,
    toast,
    React,
    Plugin,
    voxura,
    i18next,
    Patcher,
    Voxeliface,
    PluginUtil,
    PluginSystem
};