import MinecraftPaper from './minecraft-paper';
import MinecraftQuiltCreator from './minecraft-quilt';
import MinecraftFabricCreator from './minecraft-fabric';
import MinecraftJavaServerCreator from './minecraft-java-server';
import MinecraftJavaClientCreator from './minecraft-java-client';

import type { InstanceCreator } from '../../types';
export default [
	MinecraftJavaClientCreator, MinecraftQuiltCreator, MinecraftFabricCreator,
	MinecraftJavaServerCreator, MinecraftPaper
] as InstanceCreator[];