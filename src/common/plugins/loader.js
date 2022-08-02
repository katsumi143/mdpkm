import React from 'react';
import * as xml from 'xmlbuilder2';
import { t } from 'i18next';
import toast from 'react-hot-toast';
import semver from 'semver';
import * as http from '@tauri-apps/api/http';
import { appDir } from '@tauri-apps/api/path';
import * as Icons from 'react-bootstrap-icons';

import API from '../api';
import Util from '../util';
import Patcher from './patcher';
import PluginAPI from './api';
import Instances from '../instances';
import PluginSystem from './system';
import * as Voxeliface from '/voxeliface';
import { APP_NAME, APP_VERSION } from '../constants';

// For plugin developers:
// https://docs.mdpkm.voxelified.com/docs/category/plugin-api
const compiler = await import('@nx-js/compiler-util');
const appDirectory = await appDir();
export default class PluginLoader {
    static loaded = {};
    static pluginApi = new PluginAPI(this);

    static async loadPlugin(name, path) {
        const pluginPath = `${path}/main.js`;
        if (!await Util.fileExists(pluginPath))
            throw new Error(`missing main.js`);

        const manifestPath = `${path}/manifest.json`;
        if (!await Util.fileExists(manifestPath))
            throw new Error(`missing manifest.json`);

        const manifest = await Util.readTextFile(manifestPath).then(JSON.parse);
        if(this.loaded[manifest.id])
            throw new Error(`plugin has already been loaded.`);

        const depend = manifest.depends?.mdpkm;
        if(depend && !semver.satisfies(APP_VERSION, depend))
            throw new Error(`plugin requires ${APP_NAME} v${semver.minVersion(depend)}`)

        this.loaded[manifest.id] = {
            path,
            manifest
        };

        const code = compiler.compileCode(await Util.readTextFile(pluginPath));
        await code({
            t,
            xml,
            API,
            Util,
            http,
            toast,
            React,
            Icons,
            Patcher,
            Instances,
            PluginAPI: this.pluginApi,
            Voxeliface,
            PluginSystem
        });
        toast.success(`'${name}' has loaded.`);
    }

    static async loadPluginFile(name, path) {
        const manifest = await Util.readFileInZip(path, 'manifest.json').then(JSON.parse).catch(console.warn);
        if (manifest && (manifest.id || manifest.name)) {
            const pluginPath = `${appDirectory}/temp/${manifest.id ?? manifest.name}-${manifest.version ?? '0.0.0'}`;
            if (await Util.fileExists(pluginPath))
                await Util.removeDir(pluginPath);
            await Util.createDirAll(pluginPath);
            await Util.extractZip(path, pluginPath);
            await this.loadPlugin(name, pluginPath);
        } else
            throw new Error('Invalid Manifest');
    }

    static async loadDirectory(dir) {
        const files = await Util.readDir(dir);
        for (const { name, path, isDir } of files)
            try {
                if (isDir)
                    await this.loadPlugin(name, path);
                else if (name.endsWith('.plugin') || name.endsWith('.zip'))
                    await this.loadPluginFile(name, path);
            } catch(err) {
                console.warn(err);
                toast.error(`'${name}' failed to load.\n${err.message}`);
            }
    }
};
compiler.expose('JSON', 'Array', 'console', 'window', 'Object', 'Promise');
PluginSystem.prototype.api = PluginLoader.pluginApi;