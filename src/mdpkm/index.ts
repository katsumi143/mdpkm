import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

import NewsSource from './news/source';
import { NEWS_SOURCES } from './news';
import { Instance, Component } from '../../voxura';
export enum LoaderIssueId {
    MissingLoaderEntry,
    LaunchUnavailable,
    MissingLoader
}
export enum LoaderIssueType {
    Warning,
    Error
}
export interface LoaderIssue {
    id: LoaderIssueId
    type: LoaderIssueType
    extra?: any[]
}
export interface LoaderEntryOptions {
    icon?: string
    display?: (instance: Instance) => string
    category?: string
}
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
}

export default new class mdpkm {
    public readonly newsSources: NewsSource<unknown>[] = [];
    public constructor() {
        for (const source of NEWS_SOURCES)
            this.newsSources.push(new source());
    }

    public getNewsSource(id: string) {
        return this.newsSources.find(source => source.id === id);
    }
}

import MinecraftQuilt from './instance-creator/minecraft-quilt';
import MinecraftPaper from './instance-creator/minecraft-paper';
import MinecraftFabric from './instance-creator/minecraft-fabric';
import MinecraftJavaClient from './instance-creator/minecraft-java-client';
import MinecraftJavaServer from './instance-creator/minecraft-java-server';
import type InstanceCreator from './instance-creator';
export const INSTANCE_CREATORS: InstanceCreator[] = [
	new MinecraftJavaClient(),
	new MinecraftQuilt(),
	new MinecraftFabric(),

	new MinecraftJavaServer(),
	new MinecraftPaper()
]

export { default as InstanceCreator } from './instance-creator';

import IrisShaders from '../interface/components/IrisShaders';
import PluginManagement from '../interface/components/PluginManagement';
import ServerManagement from '../interface/components/ServerManagement';
import JavaServerSettings from '../interface/components/JavaServerSettings';
import ResourcePackManagement from '../interface/components/ResourcePackManagement';
import { JSXElementConstructor } from 'react';
export const COMPONENT_EXTRAS: Record<Component["id"], ComponentExtra> = {
	[MinecraftQuilt.id]: {
		enabledContentTabs: ['essential', 'modSearch', 'modManagement']
	},
	[MinecraftFabric.id]: {
		contentTabs: [IrisShaders],
		enabledContentTabs: ['essential', 'modSearch', 'modManagement']
	},
	[MinecraftJavaClient.id]: {
		contentTabs: [ResourcePackManagement],
		settingsTabs: [ServerManagement]
	},
	[MinecraftJavaServer.id]: {
		settingsTabs: [JavaServerSettings]
	},
	[MinecraftPaper.id]: {
		contentTabs: [PluginManagement]
	}
}

export interface ComponentExtra {
	contentTabs?: JSXElementConstructor<{ instance: Instance }>[],
	settingsTabs?: JSXElementConstructor<{ instance: Instance }>[],
	enabledContentTabs?: ('essential' | 'modSearch' | 'modManagement')[]
}