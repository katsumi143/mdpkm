import type PluginSystem from './';
export default abstract class Plugin {
    public abstract id: string;
    public abstract icon?: string;
    public abstract version: string;

    public abstract minAppVersion: string;

    protected system: PluginSystem;

    constructor(system: PluginSystem) {
        this.system = system;
    }

    abstract init(): Promise<void> | void

    registerLoader(id: string) {

    }
};