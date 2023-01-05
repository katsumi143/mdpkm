import MinecraftJavaClientCreator from './minecraft-java-client';
import { VersionedComponent, MinecraftJavaServer } from '../../../voxura';
export default class MinecraftJavaServerCreator extends MinecraftJavaClientCreator {
	public static id: string = 'minecraft-java-server'
	public static category: string = 'minecraft2'
	public readonly component: typeof VersionedComponent = MinecraftJavaServer
}