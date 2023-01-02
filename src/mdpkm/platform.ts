import { fetch, ResponseType } from '@tauri-apps/api/http';

import { Mod, Project, Platform, Instance, ProjectSide, GameComponent } from '../../voxura';
export default class mdpkmPlatform extends Platform<mdpkmProject> {
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
		const hits = Object.values(INTERNAL_PROJECTS);
        return Promise.resolve({
			hits,
			limit: hits.length,
			offset: 0,
			total_hits: hits.length
		});
    }

    public async getProject(id: string): Promise<mdpkmProject> {
        return new mdpkmProject(id, await this.getProjectData(id), this);
    }

    private getProjectData(id: string): Promise<ProjectData> {
		return Promise.resolve(INTERNAL_PROJECTS[id])
    }

    public async getMod(id: string): Promise<mdpkmMod> {
        return new mdpkmMod(id, await this.getProjectData(id), this);
    }

	public get baseUserURL() {
		return '';
	}

	public get baseProjectURL() {
		return '';
	}
}

export interface ProjectData {
	slug: string
	title: string
	author: string
	website: string
	follows?: number
	icon_url?: string
	downloads?: number
    project_id: string
	description: string
}
export class mdpkmProject extends Project<ProjectData, mdpkmPlatform> {
	public getSide(): ProjectSide {
        return ProjectSide.Client;
    }

    public async getLatestVersion(instance: Instance) {
        const versions = await this.getVersions();
		const { components } = instance.store;
        return versions.find(({ loaders, game_versions }) =>
            loaders.some((l: any) => components.some(c => c.getPlatformId(this.source) === l)) && game_versions.some((v: any) => components.some(c => c instanceof GameComponent && c.version === v))
        );
    }

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

	public get displayName() {
        return this.data.title;
    }

    public get summary() {
        return this.data.description;
    }

    public get author() {
        return this.data.author;
    }

    public get slug() {
        return this.data.slug;
    }

    public get downloads() {
        return this.data.downloads;
    }
	public get followers() {
        return this.data.follows;
    }

    public get website(): string {
        return this.data.website;
    }

    public get webIcon(): string | undefined {
        return this.data.icon_url;
    }
}
export class mdpkmMod extends mdpkmProject implements Mod {
    
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

export const INTERNAL_PROJECTS: Record<string, ProjectData> = {
	'essential-container': {
		slug: 'essential-container',
		title: 'Essential',
		author: 'Essential',
		website: 'https://essential.gg',
		icon_url: 'img/icons/essential_mod.svg',
		project_id: 'essential-container',
		description: 'Essential is a quality of life mod that boosts Minecraft Java to the next level.'
	}
}