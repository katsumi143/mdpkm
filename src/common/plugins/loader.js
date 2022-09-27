import React from 'react';
import { t } from 'i18next';
import toast from 'react-hot-toast';
import * as xml from 'xmlbuilder2';
import * as http from '@tauri-apps/api/http';
import * as Icons from 'react-bootstrap-icons';

import API from '../api';
import Util from '../util';
import Patcher from './patcher';
import PluginAPI from './api';
import * as voxura from '../voxura';
import PluginSystem from './system';
import * as Voxeliface from '/voxeliface';

// For plugin developers:
// https://docs.mdpkm.voxelified.com/docs/category/plugin-api
export default class PluginLoader {
    static loaded = {};
    static pluginApi = new PluginAPI(this);

    static async loadPlugin(name, path, { default: func, icon, manifest }) {
        if(this.loaded[manifest.id])
            throw new Error(`plugin has already been loaded.`);

        this.loaded[manifest.id] = {
            icon,
            path,
            manifest
        };

        await func({
            t,
            xml,
            API,
            Util,
            http,
            toast,
            React,
            Icons,
            voxura,
            Patcher,
            PluginAPI: this.pluginApi,
            Voxeliface,
            PluginSystem
        });
        toast.success(`'${name}' has loaded.`);
    }

    static async loadPluginFile(name, path) {
        const code = await Util.readTextFile(path);
        const module = await import(/* @vite-ignore */`data:text/javascript;base64,${btoa(code)}`);
        const { manifest } = module;
        console.log(module);
        if (manifest && (manifest.id ?? manifest.name)) {
            await this.loadPlugin(name, path, module);
        } else
            throw new Error('Invalid Manifest');
    }

    static async loadDirectory(dir) {
        const files = await Util.readDir(dir);
        for (const { name, path, isDir } of files)
            try {
                if (isDir)
                    await this.loadPlugin(name, path);
                else if (name.endsWith('.plugin.js'))
                    await this.loadPluginFile(name, path);
            } catch(err) {
                console.warn(err);
                toast.error(`'${name}' failed to load.\n${err.message}`);
            }
    }
};
PluginSystem.prototype.api = PluginLoader.pluginApi;