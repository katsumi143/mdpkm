import type { InstanceCreator } from '../../types';
import type { ComponentVersion } from '../../../voxura';
import MinecraftJavaClientCreator from './minecraft-java-client';
import { InstanceCreatorOptionType } from '../../enums';
import { MinecraftQuilt, MinecraftJavaClient } from '../../../voxura';
export default {
	id: 'minecraft-quilt',
	options: [{
		id: 'mcVersion',
		type: InstanceCreatorOptionType.VersionPicker,
		targetId: MinecraftJavaClient.id
	}, {
		id: 'version',
		type: InstanceCreatorOptionType.VersionPicker,
		targetId: MinecraftQuilt.id
	}],
	categoryId: 'minecraft',

	execute(instance, { version, mcVersion }: { version: ComponentVersion, mcVersion: ComponentVersion }) {
		MinecraftJavaClientCreator.execute(instance, { version: mcVersion });
		instance.store.components.push(new MinecraftQuilt(instance, {
			version: version.id,
			versionCategory: version.category
		}));
	}
} satisfies InstanceCreator;