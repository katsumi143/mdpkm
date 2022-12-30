import { fetch, ResponseType } from '@tauri-apps/api/http';

import { Mod, Project, Platform } from '../../voxura';
export default class mdpkmPlatform extends Platform {
	public static id = 'mdpkm';
	public search(query: string, options: {
        limit?: number,
        facets?: string[],
        offset?: number,
        loaders?: string[],
        versions?: string[],
        categories?: string[],
        projectType?: string
    } = {}): Promise<{
        hits: mdpkmProject[],
        limit: number,
        offset: number,
        total_hits: number
    }> {
        return this.searchRaw(query, options).then(data => ({
            ...data,
            hits: data.hits.map(h => new mdpkmProject(h.project_id, h, this))
        }));
    }

    public searchMods(query: string, options: {
        limit?: number,
        facets?: string[],
        offset?: number,
        loaders?: string[],
        versions?: string[],
        categories?: string[],
        projectType?: string
    } = {}): Promise<{
        hits: mdpkmMod[],
        limit: number,
        offset: number,
        total_hits: number
    }> {
        return this.searchRaw(query, options).then(data => ({
            ...data,
            hits: data.hits.map(h => new mdpkmMod(h.project_id, h, this))
        }));
    }

    private searchRaw(query: string, options: {
        limit?: number,
        facets?: string[],
        offset?: number,
        loaders?: string[],
        versions?: string[],
        categories?: string[],
        projectType?: string
    } = {}): Promise<{
        hits: ProjectData[],
        limit: number,
        offset: number,
        total_hits: number
    }> {
        const {
            limit = 20,
            facets,
            offset = 0,
            loaders,
            versions,
            categories,
            projectType
        } = options;
        return fetch<any>('https://api.modrinth.com/v2/search', {
            query: {
                query,
                limit: limit.toString(),
                offset: offset.toString(),
                facets: facets ? JSON.stringify([
                    ...facets,
                    categories?.filter(v => v).map(cat => `categories:${cat}`),
                    loaders?.filter(v => v).map(cat => `categories:${cat}`),
                    versions?.filter(v => v).map(ver => `versions:${ver}`),
                    ...[projectType && [`project_type:${projectType}`]]
                ].filter(v => v)) : undefined
            },
            method: 'GET',
            responseType: ResponseType.JSON
        }).then(d => d.data);
    }

    public async getProject(id: string): Promise<mdpkmProject> {
        return new mdpkmProject(id, await this.getProjectData(id), this);
    }

    private getProjectData(id: string): Promise<ProjectData> {
		if (id === 'essential-container')
			return Promise.resolve({
				slug: id,
				title: 'Essential',
				author: 'Essential',
				synopsis: 'placeholder',
				icon_url: 'img/icons/essential_mod.svg',
				downloads: 0,
				project_id: id,
				client_side: 'required',
				server_side: 'unsupported'
			});
        return fetch<ProjectData>('https://api.modrinth.com/v2/project/' + id).then(r => r.data);
    }

    public async getMod(id: string): Promise<mdpkmMod> {
        return new mdpkmMod(id, await this.getProjectData(id), this);
    }

	public get baseProjectURL() {
		return '';
	}
}

export interface ProjectData {
	slug: string
	title: string
	author: string
    project_id: string
}
export class mdpkmProject extends Project {
    
}
export class mdpkmMod extends Mod implements mdpkmProject {
    public getVersions(): Promise<any[]> {
		return fetch<EssentialVersionsResponse>('https://downloads.essential.gg/v1/mods/essential/container').then(({ data }) => {
			return Object.entries(data.stable).map(([id, version]) => ({
				id,
				files: [{
					url: version.url,
					primary: true,
					filename: `essential-container.jar`
				}],
				loaders: [id.split('_')[0]],
				game_versions: [id.split('_')[1].replace(/-/g, '.')]
			}));
		});
    }
}

export interface EssentialVersion {
	url: string
	version: string
	checksum: string
}
export interface EssentialVersionsResponse {
	stable: Record<string, EssentialVersion>
	staging: Record<string, EssentialVersion>
}