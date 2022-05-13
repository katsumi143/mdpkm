import Mod from '/src/common/api/structs/mod';
import Modpack from '/src/common/api/structs/modpack';
import { CURSEFORGE_API_BASE } from '/src/common/constants';
class CurseForgeAPI {
    static SOURCE_NUMBER = 1;

    static search(query, options = {}) {
        const { game = 432, versions = [], section = 4471, categories = [] } = options;
        return this.API.makeRequest(`${CURSEFORGE_API_BASE}/addon/search`, {
            query: {
                query,
                gameId: game.toString(),
                sectionId: section.toString(),
                categoryId: categories[1],
                gameVersion: versions?.[0],
                searchFilter: query,
                modLoaderType: this.convertLoaderType(categories?.[0])
            }
        }).then(a => ({
            hits: a
        }));
    }

    static getProject(id) {
        return this.API.makeRequest(`${CURSEFORGE_API_BASE}/addon/${id}`);
    }

    static getProjectVersion(id, projectId) {
        return this.API.makeRequest(`${CURSEFORGE_API_BASE}/addon/${projectId}/file/${id}`);
    }

    static getProjectVersions(id) {
        return this.API.makeRequest(`${CURSEFORGE_API_BASE}/addon/${id}/files`);
    }

    static getCompatibleVersion({ loader }, versions) {
        const loaderType = this.convertLoaderType(loader.type);
        return versions.sort((a, b) => new Date(b.fileDate) - new Date(a.fileDate)).find(({ gameVersion }) =>
            gameVersion.some(l => l === loaderType) && gameVersion.some(v => v === loader.game)
        );
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
                hits: hits.map(m => new Mod(m, 'CurseForge')),
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
                hits: hits.map(m => new Modpack(m)),
                ...data
            };
        });
    }

    static getCategories() {
        return CurseForgeAPI.API.makeRequest(`${CURSEFORGE_API_BASE}/category/section/4471`).then(categories =>
            categories.map(({ id, name, avatarUrl }) => ({
                id,
                name,
                icon: avatarUrl
            }))
        );
    }

    static getVersions() {
        return CurseForgeAPI.API.makeRequest(`${CURSEFORGE_API_BASE}/minecraft/version`).then(versions =>
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