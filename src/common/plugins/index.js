import { appDir } from '@tauri-apps/api/path';

import Util from '../util';
import Loader from './loader';

// For plugin developers:
// https://docs.mdpkm.voxelified.com/docs/category/plugin-api
const appDirectory = await appDir();
export default class Plugins {
    static path = `${appDirectory}/plugins`;

    static async init() {
        await this.loadPlugins();
    }

    static loadPlugins() {
        return this.checkFolder().then(() => Loader.loadDirectory(this.path));
    }

    static async checkFolder() {
        if (!await Util.fileExists(this.path))
            return Util.createDirAll(this.path);
    }
};