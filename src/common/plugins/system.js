import API from '../api';

// For plugin developers:
// http://docs.mdpkm.voxelified.com/docs/plugin-api/pluginsystem
export default class PluginSystem {
    constructor(id) {
        this.id = id;
    }

    addLoader(id, options = {}) {
        const { icon, banner, ...restOptions } = options;
        API.addLoader(id,
            icon ? this.api.getPath(this.id, icon) : null,
            this, {
                banner: banner ? this.api.getPath(this.id, banner) : null,
                ...restOptions
            }
        );
    }
};