import { path } from '@tauri-apps/api';

import Util from './util';

const dataDefaults = {
    settings: {
        
    },
    javaData: {
        installed: []
    }
};

class DataObject {
    constructor(dataController, dataName, dataPath, cache) {
        this.dataController = dataController;
        this.dataName = dataName;
        this.dataPath = dataPath;
        this.cache = cache;

        if (!this.cache)
            this.cache = dataDefaults[dataName];
        this.updateStored(this.cache, dataDefaults[dataName]);
    }

    static async build(dataController, dataName) {
        return new Promise(async(resolve) => {
            let cache = await DataObject.getData(dataController, dataName);
            let dataPath = `${dataController.dataPath}/${dataName}.json`;
            resolve(new DataObject(dataController, dataName, dataPath, cache));
        });
    }

    updateStored(cache, def) {
        let defaultKeys = Object.keys(def);
        for (let i = 0; i < defaultKeys.length; i++) {
            let cacheValue = cache[defaultKeys[i]];
            let defaultValue = def[defaultKeys[i]];
            if (defaultValue !== undefined && cacheValue === undefined) {
                cache[defaultKeys[i]] = def[defaultKeys[i]];
            } else if (typeof cacheValue == "object") {
                this.updateStored(cacheValue, defaultValue);
            }
        }
        this.save();
        return this;
    }

    add(value) {
        if(!this.cache instanceof Array)
            throw new TypeError("DATA_IS_OBJECT");
        this.cache.push(value);
        this.save();
        return this;
    }

    get(path) {
        let pathArray = path.split(".");
        let value = this.cache;
        for (let i = 0; i < pathArray.length; i++) {
            let index = pathArray[i];
            value = value[index];
        }
        return value;
    }

    getAll() {
        return DataObject.getData(this.dataController, this.dataName);
    }

    static async getData(dataController, dataName) {
        const dataPath = `${dataController.dataPath}/${dataName}.json`;
        if(!await Util.fileExists(dataPath))
            return null;
        const cache = await Util.readTextFile(
            dataPath
        );
        return JSON.parse(cache);
    }

    set(path, newValue) {
        let schema = this.cache;
        let pathArray = path.split(".");
        let length = pathArray.length;
        for (let i = 0; i < length - 1; i++) {
            let index = pathArray[i];
            schema = schema[index];
        }
        schema[pathArray[length - 1]] = newValue;
        this.save();
        return this;
    }

    async save() {
        if(!await Util.fileExists(this.dataController.dataPath))
            await Util.createDir(this.dataController.dataPath); 
        Util.writeFile(
            this.dataPath,
            JSON.stringify(this.cache)
        );
        return this;
    }
}

export class DataController {
    constructor(dataPath) {
        this.dataPath = dataPath;
    }

    static async build() {
        return new Promise(async(resolve, reject) => {
            const dataPath = path ? await path.appDir() : "";
            if(!await Util.fileExists(dataPath))
                await Util.createDir(dataPath);
            resolve(new DataController(dataPath.replace(/\/+|\\+/g, "/")));
        });
    }

    getData(name) {
        return DataObject.build(this, name);
    }
};

export default await DataController.build();