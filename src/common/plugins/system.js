import API from '../api';

// For plugin developers:
// https://docs.mdpkm.voxelified.com/docs/plugin-api/pluginsystem
const VALID_TASKS = ['MODIFY_FINAL'];
export default class PluginSystem {
    constructor(id) {
        this.id = id;
    }

    // https://docs.mdpkm.voxelified.com/docs/plugin-api/pluginsystem#addloader
    addLoader(id, options = {}) {
        const { icon, banner, ...restOptions } = options;
        API.addLoader(id,
            icon,
            this, {
                banner,
                ...restOptions
            }
        );
    }
    
    registerLaunchTask(type, func) {
        if(!VALID_TASKS.some(v => v === type))
            throw new TypeError(`Invalid Launch Task "${type}"`);
        /*Instances.launchTasks.push({
            type,
            func,
            source: this
        });*/
    }
};