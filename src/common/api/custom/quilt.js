import Util from '../../util';
import { QUILT_API_BASE } from '../../constants';
export default class QuiltAPI {
    static type = 'java-modded';
    static recommendedMod = ['qsl', 'modrinth'];
    
    static async init() {
        this.API.addLoader('quilt', 'img/icons/loaders/quilt.svg', this, {
            banner: 'img/banners/loaders/quilt.svg',
        });
    }

    static getVersions() {
        return this.API.makeRequest(`${QUILT_API_BASE}/versions`).then(versions => {
            const fabric = {};
            const loaders = versions.loader.map(y => y.version);
            for (const { version } of versions.game)
                fabric[version] = loaders;
            return fabric;
        });
    }

    static async downloadManifest(path, game, version) {
        const manifest = await this.API.makeRequest(
            `${QUILT_API_BASE}/versions/loader/${encodeURIComponent(game)}/${encodeURIComponent(version)}/profile/json`
        );
        await Util.writeFile(path, JSON.stringify(manifest));
    }
};