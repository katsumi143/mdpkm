import FabricLoader from './minecraft-fabric';
import { MinecraftQuilt } from '../../../voxura';
export default class QuiltLoader extends FabricLoader {
    public static id: string = 'quilt';
    public readonly component = MinecraftQuilt;
};