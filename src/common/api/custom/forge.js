import { FORGE_VERSION_MANIFEST } from '../../constants';
export default class ForgeAPI {
    static type = 'java-modded';
    
    static async init() {
        this.API.addLoader('forge', 'img/icons/loaders/forge.svg', this, {
            banner: 'img/banners/loaders/forge.png',
        });
    }

    static getVersions() {
        return this.API.makeRequest(FORGE_VERSION_MANIFEST);
    }
};