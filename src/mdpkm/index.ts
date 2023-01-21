import NewsSource from './news/source';
import { NEWS_SOURCES } from './news';
import { Instance, Component } from '../../voxura';
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
import MinecraftServers from '../interface/components/minecraft/servers';
import JavaServerSettings from '../interface/components/JavaServerSettings';
import MinecraftResourcePacks from '../interface/components/minecraft/resourcepacks';
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
		contentTabs: [MinecraftResourcePacks],
		settingsTabs: [MinecraftServers]
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