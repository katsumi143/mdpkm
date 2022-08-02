import pMap from 'p-map-browser';

import Mod from '/src/common/api/structs/mod';
import Modpack from '/src/common/api/structs/modpack';
import Project from '/src/common/api/structs/project';

import Util from '../../util';
import { CURSEFORGE_API_BASE, CURSEFORGE_CORE_KEY } from '/src/common/constants';

const gameId = 432;
class CurseForgeAPI {
    static id = 'curseforge';
    static icon = 'img/icons/platforms/curseforge.svg';
    static announcement = 'Some CurseForge projects may be unavailable for download.';

    static makeRequest(url, options = {}) {
        (options.headers = options.headers ?? {})['x-api-key'] = CURSEFORGE_CORE_KEY;
        return this.API.makeRequest(url, options);
    }

    // https://docs.mdpkm.voxelified.com/docs/plugin-api/classes/api-platform#search
    static search(query, options = {}) {
        const { game = gameId, versions = [], section = 4471, categories = [] } = options;
        return this.makeRequest(`${CURSEFORGE_API_BASE}/mods/search`, {
            query: {
                query,
                gameId: game.toString(),
                classId: section.toString(),
                sortField: '2',
                categoryId: categories[1],
                gameVersion: versions?.[0],
                searchFilter: query,
                modLoaderType: this.convertLoaderType(categories?.[0])
            }
        }).then(a => ({
            hits: a.data
        }));
    }

    // https://docs.mdpkm.voxelified.com/docs/plugin-api/classes/api-platform#getproject
    static getProject(id) {
        return this.makeRequest(`${CURSEFORGE_API_BASE}/mods/${id}`).then(project =>
            new Project(project.data, this.id)
        );
    }

    static getProjectVersion(id, projectId) {
        return this.makeRequest(`${CURSEFORGE_API_BASE}/mods/${projectId}/files/${id}`).then(v => v.data);
    }

    static getProjectVersions(id) {
        return this.makeRequest(`${CURSEFORGE_API_BASE}/mods/${id}/files`).then(v => v.data.sort((a, b) => new Date(b.fileDate) - new Date(a.fileDate)));
    }

    static getCompatibleVersion({ loader }, versions) {
        const loaderType = this.convertLoaderType(loader.type);
        return versions.filter(v => v.downloadUrl).find(({ gameVersions }) =>
            gameVersions.some(l => l === loaderType) && gameVersions.some(v => v === loader.game)
        );
    }

    static canImport(path) {
        return Util.fileExists(`${path}/manifest.json`).catch(() => false);
    }

    static async finishImport(instancePath) {
        const manifest = await Util.readTextFile(`${instancePath}/manifest.json`).then(JSON.parse);
        const overridesPath = `${instancePath}/${manifest.overrides ?? 'overrides'}`;
        if (await Util.fileExists(overridesPath)) {
            for (const { name, path } of await Util.readDir(overridesPath))
                await Util.moveFolder(path, `${instancePath}/${name}`);
            await Util.removeDir(overridesPath);
        }
        await Util.copyFile(`${Util.tempPath}/${manifest.name}.png`, `${instancePath}/icon.png`);
        await Util.removeFile(`${instancePath}/modlist.html`);

        if (manifest.manifestVersion === 1) {
            const loader = this.convertFormatLoader(manifest.minecraft);
            await pMap(manifest.files, async({ fileID, projectID }) => {
                const { fileName, downloadUrl, isAvailable } = await this.getProjectVersion(fileID, projectID);
                if (!isAvailable)
                    throw new Error(`${fileName} is unavailable`);
                if (!downloadUrl)
                    throw new Error(`${(await this.getProject(projectID)).title} has blocked usage in mdpkm.`);
                const ok = await Util.pmapTry(() =>
                    Util.downloadFilePath(downloadUrl, `${instancePath}/mods/${fileName}`)
                );
                if (!ok)
                    throw new Error(`Failed to download ${fileID} (${projectID})`);
            }, { concurrency: 20 });

            return [loader];
        } else
            throw new Error(`Unknown Format Version: ${manifest.formatVersion}`);
    }

    static async downloadModpack(id) {
        const version = (await this.getProjectVersions(id))[0];
        return Util.downloadFile(version.downloadUrl, Util.tempPath, true);
    }

    static readModpackManifest(archivePath) {
        return Util.readFileInZip(archivePath, 'manifest.json').then(JSON.parse);
    }

    static convertFormatLoader(data) {
        const loader = data.modLoaders.find(m => m.primary).id.split('-');
        return {
            game: data.version,
            type: loader[0],
            version: loader[1]
        };
    }

    static convertLoaderType(type) {
        return {
            forge: 'Forge',
            quilt: 'Fabric',
            fabric: 'Fabric'
        }[type];
    }
};
CurseForgeAPI.Mods = class Mods {
    static search(query, options = {}) {
        return CurseForgeAPI.search(query, {
            section: 6,
            ...options
        }).then(({ hits, ...data }) => {
            return {
                hits: hits.map(m => new Mod(m, CurseForgeAPI.id)),
                ...data
            };
        });
    }
};
CurseForgeAPI.Modpacks = class Modpacks {
    static search(query, options = {}) {
        return CurseForgeAPI.search(query, {
            section: 4471,
            ...options
        }).then(({ hits, ...data }) => {
            return {
                hits: hits.map(m => new Modpack(m, CurseForgeAPI.id)),
                ...data
            };
        });
    }

    static getCategories() {
        return CurseForgeAPI.makeRequest(`${CURSEFORGE_API_BASE}/categories`, {
            query: { gameId }
        }).then(categories =>
            categories.map(({ id, name, avatarUrl }) => ({
                id,
                name,
                icon: avatarUrl
            }))
        );
    }

    static getVersions() {
        return CurseForgeAPI.makeRequest(`${CURSEFORGE_API_BASE}/minecraft/version`).then(versions =>
            versions.map(({ versionString }) => ({
                id: versionString,
                name: versionString,
                icon: null
            }))
        );
    }

    static getCompatibleVersion({ config }, versions) {
        return versions.find(({ loaders, game_versions }) =>
            loaders.some(l => l === config.loader.type) && game_versions.some(v => v === config.loader.game)
        );
    }
};

export default CurseForgeAPI;