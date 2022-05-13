import Mod from '/src/common/api/structs/mod';
import Project from '/src/common/api/structs/project';
import { MODRINTH_API_BASE } from '/src/common/constants';
class ModrinthAPI {
    static projectCache = [];
    static SOURCE_NUMBER = 0;

    static search(query, options = {}) {
        const { facets = [], versions = [], categories = [], projectType } = options;
        return this.API.makeRequest(`${MODRINTH_API_BASE}/search`, {
            query: {
                query,
                facets: JSON.stringify([
                    ...facets,
                    ...versions.map(ver => [`versions:${ver}`]),
                    ...categories.map(cat => [`categories:${cat}`]),
                    ...[projectType && [`project_type:${projectType}`]]
                ])
            }
        });
    }

    static async getProject(id) {
        return this.projectCache[id] ??
            this.API.makeRequest(`${MODRINTH_API_BASE}/project/${id}`).then(project => {
                this.projectCache[id] = new Project(project);
                return this.projectCache[id];
            });
    }

    static getProjectVersion(id) {
        return this.API.makeRequest(`${MODRINTH_API_BASE}/version/${id}`);
    }

    static getProjectVersions(id) {
        return this.API.makeRequest(`${MODRINTH_API_BASE}/project/${id}/version`);
    }

    static getCompatibleVersion({ loader }, versions) {
        return versions.find(({ loaders, game_versions }) =>
            loaders.some(l => l === loader.type) && game_versions.some(v => v === loader.game)
        );
    }
};
ModrinthAPI.Mods = class Mods {
    static async get(id) {
        return new Mod(await ModrinthAPI.getProject(id).then(p => p.data));
    }

    static search(query, options = {}) {
        return ModrinthAPI.search(query, {
            projectType: 'mod',
            ...options
        }).then(({ hits, ...data }) => {
            return {
                hits: hits.map(m => new Mod(m, 'Modrinth')),
                ...data
            };
        });
    }
};

export default ModrinthAPI;