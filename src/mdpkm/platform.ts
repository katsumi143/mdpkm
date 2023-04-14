import { fetch } from '@tauri-apps/api/http';

import { Project, Platform, Instance, ProjectType, ComponentType } from '../../voxura';
const mdpkmPlatform = new class mdpkmPlatform extends Platform<mdpkmProject> {
	public id = 'mdpkm'
	public search(query: string, type: ProjectType, options: {
        limit?: number,
        facets?: string[],
        offset?: number,
        loaders?: string[],
        versions?: string[],
        categories?: string[]
    } = {}): Promise<{
        hits: mdpkmProject[]
        limit: number
		total: number
        offset: number
    }> {
        const hits = Object.values(INTERNAL_PROJECTS);
        return Promise.resolve({
			hits: hits.map(h => new mdpkmProject(h.id, ProjectType.Mod, h)),
			limit: hits.length,
			total: hits.length,
			offset: 0
		});
    }

    public async getProject(id: string): Promise<mdpkmProject> {
		const data = await this.getProjectData(id);
        return new mdpkmProject(id, ProjectType.Mod, data);
    }
	public getVersion(id: string) {
		return null as any;
	}

    private getProjectData(id: string): Promise<ProjectData> {
		return Promise.resolve(INTERNAL_PROJECTS[id]);
    }

	public get baseUserURL() {
		return '';
	}

	public get baseProjectURL() {
		return '';
	}
}
export default mdpkmPlatform

export class mdpkmProject extends Project<ProjectData> {
	public source = mdpkmPlatform
	public async getLatestVersion(instance: Instance) {
        const versions = await this.getVersions();

		const components = instance.store.components.filter(c => c.type === ComponentType.Loader).map(c => c.getIdForProject(this));
        const { gameComponent } = instance;
		return versions.find(({ loaders, game_versions }) =>
            loaders.some(l => components.includes(l)) && game_versions.includes(gameComponent.version)
        );
    }

    public getVersions() {
		return fetch<EssentialVersionsResponse>('https://downloads.essential.gg/v1/mods/essential/container').then(({ data }) => {
			return Object.entries(data.stable).map(([id, version]) => ({
				id,
				files: [{
					url: version.url,
					primary: true,
					filename: `essential-container.jar`
				}],
				loaders: [id.split('_')[0], id.includes('fabric') ? 'quilt' : undefined].filter(l => l) as string[],
				dependencies: [],
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

	public get categories() {
		return this.data.categories;
	}
	public get displayCategories() {
		return this.categories;
	}

	public get clientSide() {
		return 'optional' as any;
	}
	public get serverSide() {
		return 'unsupported' as any;
	}
}

export interface ProjectData {
	id: string
	slug: string
	title: string
	author: string
	website: string
	follows?: number
	icon_url?: string
	downloads?: number
	categories: string[]
	description: string
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
		id: 'essential-container',
		slug: 'essential-container',
		title: 'Essential',
		author: 'Essential',
		website: 'https://essential.gg',
		icon_url: 'img/icon/project/essential.svg',
		categories: ['social', 'quilt', 'fabric', 'forge'],
		description: 'Essential is a quality of life mod that boosts Minecraft Java to the next level.'
	}
}