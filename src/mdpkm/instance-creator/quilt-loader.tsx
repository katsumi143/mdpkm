import FabricLoader from './fabric-loader';
import QuiltComponent from '../../../voxura/src/instances/component/quilt-loader';
export default class QuiltLoader extends FabricLoader {
    public static id: string = 'quilt';
    protected readonly component = QuiltComponent;
};