import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

import Instance from '../../voxura/src/instances/instance';
import NewsSource from './news/source';
import { NEWS_SOURCES } from './news';
export enum LoaderIssueId {
    MissingLoaderEntry,
    LaunchUnavailable,
    MissingLoader
};
export enum LoaderIssueType {
    Warning,
    Error
};
export interface LoaderIssue {
    id: LoaderIssueId,
    type: LoaderIssueType,
    extra?: any[]
};
export interface LoaderEntryOptions {
    icon?: string,
    display?: (instance: Instance) => string,
    category?: string
};
export class LoaderEntry {
    public readonly id: string;
    public readonly category: string;
    private icon?: string;
    private _display?: (instance: Instance) => string;
    constructor(id: string, options: LoaderEntryOptions = {}) {
        this.id = id;
        this.icon = options.icon;
        this._display = options.display;
        this.category = options.category ?? 'what';
    }

    public display(instance: Instance): string {
        return this._display?.(instance) ?? this.displayName;
    }

    public get displayName(): string {
        return t(this.translationKey);
    }

    public get displaySummary(): string {
        return t(this.displaySummaryKey);
    }

    public get displayIcon(): string {
        return this.icon ?? 'img/icons/instances/default8.svg'
    }

    public useDisplayName(): string {
        return useTranslation().t(this.translationKey);
    }

    public useDisplaySummary(): string {
        return useTranslation().t(this.displaySummaryKey);
    }

    private get translationKey(): string {
        return 'app.mdpkm.common:loader.' + this.id;
    }

    private get displaySummaryKey(): string {
        return this.translationKey + '.summary';
    }
};

const LOADER_OPTIONS: Record<string, LoaderEntryOptions> = {
    'minecraft-java-vanilla': {
        icon: 'img/icons/minecraft/java.png',
        category: 'Mojang Studios'
    },
    'minecraft-bedrock-vanilla': {
        icon: 'img/icons/minecraft/bedrock.png',
        category: 'Mojang Studios'
    },
    fabric: {
        icon: 'img/icons/loaders/fabric.png',
        category: 'Third Party Loaders'
    },
    quilt: {
        icon: 'img/icons/loaders/quilt.svg',
        category: 'Third Party Loaders'
    }
};
export default new class mdpkm {
    public readonly newsSources: NewsSource<unknown>[] = [];
    public readonly loaderEntries: LoaderEntry[] = [];
    public constructor() {
        /*for (const loader of LOADER_MAP)
            this.addLoaderEntry(loader.id, LOADER_OPTIONS[loader.id]);*/
        for (const source of NEWS_SOURCES)
            this.newsSources.push(new source());
    }

    public addLoaderEntry(id: string, options?: LoaderEntryOptions): void {
        this.loaderEntries.push(new LoaderEntry(id, options));
    }

    public getLoaderEntry(id: string): LoaderEntry | void {
        return this.loaderEntries.find(entry => entry.id === id);
    }

    public getNewsSource(id: string) {
        return this.newsSources.find(source => source.id === id);
    }

    public getLoaderIssues(id: string): LoaderIssue[] {
        const issues: LoaderIssue[] = [];
        const entry = this.getLoaderEntry(id);
        if (!entry)
            issues.push({
                id: LoaderIssueId.MissingLoaderEntry,
                type: LoaderIssueType.Error,
                extra: [id]
            });
        /*const loader = getLoaderById(id);
        if (loader === UnknownLoader)
            issues.push({
                id: LoaderIssueId.MissingLoader,
                type: LoaderIssueType.Error,
                extra: [id]
            });*/

        if (issues.find(i => i.id === LoaderIssueId.MissingLoaderEntry))
            issues.push({
                id: LoaderIssueId.LaunchUnavailable,
                type: LoaderIssueType.Error
            });

        return issues;
    }
};

import QuiltLoader from './instance-creator/quilt-loader';
import FabricLoader from './instance-creator/fabric-loader';
import MinecraftJavaVanilla from './instance-creator/minecraft-java-vanilla';
export const INSTANCE_CREATORS = [new MinecraftJavaVanilla(), new FabricLoader(), new QuiltLoader()];

export { default as InstanceCreator } from './instance-creator';