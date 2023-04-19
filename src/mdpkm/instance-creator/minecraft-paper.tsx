import type { InstanceCreator } from '../../types';
import type { ComponentVersion } from '../../../voxura';
import MinecraftJavaServerCreator from './minecraft-java-server';
import { InstanceCreatorOptionType } from '../../enums';
import { MinecraftPaper, MinecraftJavaClient } from '../../../voxura';
export default {
	id: 'minecraft-paper',
	options: [{
		id: 'mcVersion',
		type: InstanceCreatorOptionType.VersionPicker,
		targetId: MinecraftJavaClient.id
	}, {
		id: 'version',
		type: InstanceCreatorOptionType.VersionPicker,
		targetId: MinecraftPaper.id
	}],
	categoryId: 'minecraft2',

	execute(instance, data: { version: ComponentVersion, mcVersion: ComponentVersion }) {
		MinecraftJavaServerCreator.execute(instance, { version: data.mcVersion });
		instance.store.components.push(new MinecraftPaper(instance, { version: data.version.id }));
	}
} satisfies InstanceCreator;