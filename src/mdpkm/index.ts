import NewsSource from './news/source';
import { NEWS_SOURCES } from './news';
import { Instance, Component, MinecraftPaper, MinecraftQuilt, MinecraftFabric, MinecraftJavaClient, MinecraftJavaServer } from '../../voxura';
export default new class mdpkm {
    public newsSources: NewsSource<unknown>[] = [];
    public constructor() {
        for (const source of NEWS_SOURCES)
            this.newsSources.push(new source());
    }

    public getNewsSource(id: string) {
        return this.newsSources.find(source => source.id === id);
    }
}


import IrisShaders from '../interface/components/IrisShaders';
import PluginManagement from '../interface/components/PluginManagement';
import MinecraftServers from '../interface/components/minecraft/servers';
import JavaServerSettings from '../interface/components/JavaServerSettings';
import MinecraftResourcePacks from '../interface/components/minecraft/resourcepacks';
import type { JSXElementConstructor } from 'react';
export const COMPONENT_EXTRAS: Record<Component["id"], ComponentExtra> = {
	// client components
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

	// server components
	[MinecraftPaper.id]: {
		contentTabs: [PluginManagement]
	},
	[MinecraftJavaServer.id]: {
		settingsTabs: [JavaServerSettings]
	}
}

export interface ComponentExtra {
	contentTabs?: JSXElementConstructor<{ instance: Instance }>[],
	settingsTabs?: JSXElementConstructor<{ instance: Instance }>[],
	enabledContentTabs?: ('essential' | 'modSearch' | 'modManagement')[]
}