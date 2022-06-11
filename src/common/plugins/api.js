import i18n from 'i18next';
import { convertFileSrc } from '@tauri-apps/api/tauri';

// For plugin developers:
// http://docs.mdpkm.voxelified.com/docs/plugin-api/pluginapi
export default class PluginAPI {
    constructor(loader) {
        this.loader = loader;
    }

    getPath(id, fullPath) {
        const path = fullPath.replace(/(http|https):\/\/localhost:3000\/src\/|(http|https):\/\/tauri.localhost\/assets\//, '');
        const plugin = this.loader.loaded[id];
        return convertFileSrc(`${plugin?.path}/${path}`);
    }

    addLocaleBundle(lang, namespace, resources) {
        i18n.addResourceBundle(lang, namespace ?? 'translation', resources, true, true);
    }
};