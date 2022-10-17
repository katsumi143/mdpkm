import type PluginLoader from "./loader";
export default abstract class Plugin {
    public id: string;
    public version: string;

    public minAppVersion: string;

    private loader: PluginLoader;

    constructor(loader: PluginLoader) {
        this.loader = loader;
    }

    abstract init(): Promise<void> | void

    registerLoader(id: string) {

    }
};