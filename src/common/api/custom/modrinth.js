import pMap from 'p-map-browser';

import Mod from '/src/common/api/structs/mod';
import Modpack from '/src/common/api/structs/modpack';
import Project from '/src/common/api/structs/project';

import Util from '../../util';
import { MODRINTH_API_BASE } from '/src/common/constants';
class ModrinthAPI {
    static id = 'modrinth';
    static icon = 'img/icons/platforms/modrinth.svg';
    static projectCache = [];

    // https://docs.mdpkm.voxelified.com/docs/plugin-api/classes/api-platform#search
    static search(query, options = {}) {
        const { facets = [], versions, categories, projectType } = options;
        return this.API.makeRequest(`${MODRINTH_API_BASE}/search`, {
            query: {
                query,
                facets: JSON.stringify([
                    ...facets,
                    versions?.filter(v => v).map(ver => `versions:${ver}`),
                    categories?.filter(v => v).map(cat => `categories:${cat}`),
                    ...[projectType && [`project_type:${projectType}`]]
                ].filter(v => v))
            }
        });
    }

    // https://docs.mdpkm.voxelified.com/docs/plugin-api/classes/api-platform#getproject
    static async getProject(id) {
        return this.projectCache[id] ??
            this.API.makeRequest(`${MODRINTH_API_BASE}/project/${id}`).then(project => {
                this.projectCache[id] = new Project(project, this.id);
                return this.projectCache[id];
            });
    }

    static async getProjects(ids) {
        const cached = [];
        for (const id of ids)
            if(this.projectCache[id])
                cached.push(this.projectCache[id]);
        return [...await this.API.makeRequest(`${MODRINTH_API_BASE}/projects`, {
            query: { ids: JSON.stringify(ids) }
        }).then(projects =>
            projects.map(project => {
                this.projectCache[project.id] = new Project(project, this.id);
                return this.projectCache[project.id];
            })
        ), ...cached];
    }

    static getProjectVersion(id) {
        return this.API.makeRequest(`${MODRINTH_API_BASE}/version/${id}`);
    }

    static getProjectVersions(id, { loader } = {}) {
        const loaderData = this.API.getLoader(loader?.type);
        return this.API.makeRequest(`${MODRINTH_API_BASE}/project/${id}/version`, {
            versions: [loader?.game],
            categories: [loaderData?.asLoader ?? loader?.type]
        });
    }
    static getProjectVersionsBulk(ids) {
        return this.API.makeRequest(`${MODRINTH_API_BASE}/versions`, {
            query: { ids: JSON.stringify(ids) }
        });
    }

    static getCompatibleVersion({ loader }, versions) {
        const loaderData = this.API.getLoader(loader.type);
        const loaderType = loaderData.asLoader ?? loader.type;
        return versions.find(({ loaders, game_versions }) =>
            loaders.some(l => l === loaderType) && game_versions.some(v => v === loader.game)
        );
    }

    static canImport(path) {
        return Util.fileExists(`${path}/modrinth.index.json`).catch(() => false);
    }

    static async finishImport(instancePath) {
        const manifest = await Util.readTextFile(`${instancePath}/modrinth.index.json`).then(JSON.parse);
        const overridesPath = `${instancePath}/overrides`;
        if (await Util.fileExists(overridesPath)) {
            for (const { name, path } of await Util.readDir(overridesPath))
                await Util.moveFolder(path, `${instancePath}/${name}`);
            await Util.removeDir(overridesPath);
        }
        await Util.copyFile(`${Util.tempPath}/${manifest.name}.png`, `${instancePath}/icon.png`);

        if (manifest.formatVersion === 1) {
            const loader = this.convertFormatDependencies(manifest.dependencies);
            await pMap(manifest.files, async({ path, downloads }) => {
                const ok = await Util.pmapTry(async current => {
                    const url = downloads[current % downloads.length];
                    await Util.downloadFilePath(url, `${instancePath}/${path}`);
                });
                if (!ok)
                    throw new Error(`Failed to download ${path.split('/').reverse()[0]}`);
            }, { concurrency: 20 });

            return [loader];
        } else
            throw new Error(`Unknown Format Version: ${manifest.formatVersion}`);
    }

    static async downloadModpack(id) {
        const version = await this.getProjectVersions(id).then(v => v[0]);
        const file = version.files.find(f => f.primary) ?? version.files[0];
        return Util.downloadFilePath(file.url, `${Util.tempPath}/${file.filename}`, true);
    }

    static readModpackManifest(archivePath) {
        return Util.readFileInZip(archivePath, 'modrinth.index.json').then(JSON.parse);
    }

    static convertFormatDependencies(data) {
        const loader = {};
        for (const [id, version] of Object.entries(data)) {
            switch(id) {
                case 'minecraft':
                    loader.game = version;
                    break;
                case 'forge':
                case 'quilt-loader':
                case 'fabric-loader':
                    loader.type = {
                        'quilt-loader': 'quilt',
                        'fabric-loader': 'fabric'
                    }[id] ?? id;
                    loader.version = version;
                    break;
                default:
                    throw new Error(`Unknown dependency: ${id}-${version}`)
            }
        }
        return loader;
    }
};
ModrinthAPI.Mods = class Mods {
    static async get(id) {
        return new Mod(await ModrinthAPI.getProject(id).then(p => p.data), ModrinthAPI.id);
    }

    static search(query, options = {}) {
        return ModrinthAPI.search(query, {
            projectType: 'mod',
            ...options
        }).then(({ hits, ...data }) => {
            return {
                hits: hits?.map(m => new Mod(m, ModrinthAPI.id)),
                ...data
            };
        });
    }
};
ModrinthAPI.Modpacks = class Modpacks {
    static async get(id) {
        return new Modpack(await ModrinthAPI.getProject(id).then(p => p.data), ModrinthAPI.id);
    }

    static search(query, options = {}) {
        return ModrinthAPI.search(query, {
            projectType: 'modpack',
            ...options
        }).then(({ hits, ...data }) => {
            return {
                hits: hits?.map(m => new Modpack(m, ModrinthAPI.id)),
                ...data
            };
        });
    }
};

export default ModrinthAPI;