import { fetch } from '@tauri-apps/api/http';

import type { InstanceCreator } from '../../types';
import type { ComponentVersion } from '../../../voxura';
import { InstanceCreatorOptionType } from '../../enums';
import { JavaTemurin, MinecraftJavaServer } from '../../../voxura';
import { MANIFESTS_URL, MinecraftJavaManifest, VersionManifestResponse } from '../../../voxura/src/component/minecraft-java';
export default {
	id: 'minecraft-java-server',
	options: [{
		id: 'version',
		type: InstanceCreatorOptionType.VersionPicker,
		targetId: MinecraftJavaServer.id
	}],
	categoryId: 'minecraft2',

	async execute(instance, data: { version: ComponentVersion }) {
		const manifests = await fetch<VersionManifestResponse>(MANIFESTS_URL);
		const manifestData = manifests.data.versions.find(m => m.id === data.version.id);
		if (!manifestData)
			throw new Error('manifest not found');

		const manifest = await fetch<MinecraftJavaManifest>(manifestData.url);
		instance.store.components.push(
			new MinecraftJavaServer(instance, { version: data.version.id }),
			new JavaTemurin(instance, {
				version: await JavaTemurin.getLatestVersion(manifest.data.javaVersion.majorVersion)
			})
		);
	}
} satisfies InstanceCreator;