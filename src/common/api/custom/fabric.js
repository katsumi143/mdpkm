import Util from '../../util';
import { FABRIC_API_BASE } from '../../constants';
export default class FabricAPI {
    static type = 'java-modded';
    static recommendedMod = ['fabric-api', 'modrinth'];

    static async init() {
        this.API.addLoader('fabric', 'img/icons/loaders/fabric.png', this, {
            banner: 'img/icons/loaders/fabric.png',
        });
    }

    static getVersions() {
        return this.API.makeRequest(`${FABRIC_API_BASE}/versions`).then(versions => {
            const fabric = {};
            const loaders = versions.loader.map(y => y.version);
            for (const { version } of versions.game)
                fabric[version] = loaders;
            return fabric;
        });
    }

    static async downloadManifest(path, game, version) {
        const manifest = await this.API.makeRequest(
            `${FABRIC_API_BASE}/versions/loader/${encodeURIComponent(game)}/${encodeURIComponent(version)}/profile/json`
        );
        await Util.writeFile(path, JSON.stringify(manifest));
    }
};