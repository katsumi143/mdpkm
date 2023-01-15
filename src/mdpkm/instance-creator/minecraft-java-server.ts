import MinecraftJavaClientCreator from './minecraft-java-client';
import { VersionedComponent, MinecraftJavaServer, InstanceType } from '../../../voxura';
export default class MinecraftJavaServerCreator extends MinecraftJavaClientCreator {
	public static id: string = 'minecraft-java-server'
	public static category: string = 'minecraft2'
	public component: typeof VersionedComponent = MinecraftJavaServer
	public instanceType = InstanceType.Server
}