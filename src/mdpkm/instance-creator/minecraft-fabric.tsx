import type { InstanceCreator } from '../../types';
import type { ComponentVersion } from '../../../voxura';
import MinecraftJavaClientCreator from './minecraft-java-client';
import { InstanceCreatorOptionType } from '../../enums';
import { MinecraftFabric, MinecraftJavaClient } from '../../../voxura';
export default {
	id: 'minecraft-fabric',
	options: [{
		id: 'mcVersion',
		type: InstanceCreatorOptionType.VersionPicker,
		targetId: MinecraftJavaClient.id
	}, {
		id: 'version',
		type: InstanceCreatorOptionType.VersionPicker,
		targetId: MinecraftFabric.id
	}],
	categoryId: 'minecraft',

	execute(instance, data: { version: ComponentVersion, mcVersion: ComponentVersion }) {
		MinecraftJavaClientCreator.execute(instance, { version: data.mcVersion });
		instance.store.components.push(new MinecraftFabric(instance, { version: data.version.id }));
	}
} satisfies InstanceCreator;