import pMap from 'p-map-browser';
import { Buffer } from 'buffer/';
import * as tauri from '@tauri-apps/api';
import path from 'path-browserify';
import toast from 'react-hot-toast';

import lt from 'semver/functions/lt';
import gt from 'semver/functions/gt';
import gte from 'semver/functions/gte';
import coerce from 'semver/functions/coerce';

import API from './api';
import Util from './util';
import Java from './java';
import EventEmitter from './lib/EventEmitter';
import DataController from './dataController';
import { MINECRAFT_VERSION_MANIFEST, MINECRAFT_RESOURCES_URL } from './constants';

import {
    FORGE_MAVEN_BASE_URL
} from './constants';

const DEFAULT_INSTANCE_CONFIG = {
    loader: {
        type: "vanilla",
        game: "0.0.0",
        version: "0.0.0-0.0.0"
    },
    modpack: {
        source: "manual",
        project: 0,
        cachedName: "Unnamed Instance"
    },
    modifications: []
};

export class Instance extends EventEmitter {
    constructor(data, instances) {
        super();
        this.name = data.name;
        this.path = data.path;
        this.data = data;
        this.icon = data.icon;
        this.instances = instances;
        this.dataController = instances.dataController;

        this.state = null;
    }

    static async build(data, instances) {
        if(!await Util.fileExists(data.path))
            await Util.createDir(data.path);

        const iconPath = `${data.path}/icon.png`;
        if(await Util.fileExists(iconPath)) {
            const image = await Util.readBinaryFile(iconPath).catch(console.warn);
            if (image)
                data.icon = Buffer.from(image).toString('base64');
        }

        return new Instance(data, instances);
    }

    async init() {
        if(await Util.fileExists(`${this.path}/modpack.json`))
            this.modpack = await Util.readTextFile(`${this.path}/modpack.json`).then(JSON.parse);
    }

    async getMods() {
        const modCachePath = `${this.path}/modcache.json`;
        const modCache = await Util.fileExists(modCachePath) ?
            await Util.readTextFile(modCachePath).then(JSON.parse) :
            await Util.writeFile(modCachePath, "{}").then(_ => {});

        const files = await Util.readDir(`${this.path}/mods`);
        const mods = [];
        for (const { name, path } of files) {
            if (modCache[name]) {
                mods.unshift(modCache[name]);
                continue;
            }

            const forgeData = await Util.readFileInZip(path, "mcmod.info").catch(_ => null);
            if (forgeData)
                try {
                    const parsedData = JSON.parse(forgeData);
                    const { modid, name: modName, description, version } = parsedData.modList?.[0] ?? parsedData[0];
                    const mod = {
                        id: modid,
                        name: modName,
                        loader: "forge",
                        description,
                        version
                    };
                    mods.unshift(mod);
                    modCache[name] = mod;
                    continue;
                } catch(err) { console.warn(err) }

            const fabricData = await Util.readFileInZip(path, "fabric.mod.json").catch(_ => null);
            if(fabricData)
                try {
                    const { id, name: modName, description, version } = JSON.parse(fabricData);
                    const mod = {
                        id,
                        name: modName,
                        loader: "fabric",
                        description,
                        version
                    };
                    mods.unshift(mod);
                    modCache[name] = mod;
                    continue;
                } catch(err) { console.warn(err) }
        }
        await Util.writeFile(modCachePath, JSON.stringify(modCache));

        return mods;
    }

    async launch() {
        const toastHead = `Launching ${this.name}`;
        const toastId = toast.loading(`${toastHead}\nPreparing`, {
            className: 'gotham',
            position: 'bottom-right',
            duration: Infinity,
            style: { minWidth: '400px', whiteSpace: 'pre-wrap' }
        });

        const updateToastState = text => {
            this.setState(text);
            toast(`${toastHead}\n${text}`, {
                id: toastId
            });
        };

        const { loader } = await this.getConfig();
        if (!await Util.fileExists(this.getClientPath()))
            await this.instances.installMinecraft(loader.game, this, updateToastState);

        updateToastState("Reading Manifest Files");

        const manifest = JSON.parse(
            await Util.readTextFile(`${this.instances.getPath('mcVersions')}/${loader.game}.json`)
        );
        const assetsJson = JSON.parse(
            await Util.readTextFile(`${this.instances.getPath('mcAssets')}/indexes/${manifest.assets}.json`)
        );

        const assets = Object.entries(assetsJson.objects).map(
            ([key, { hash }]) => ({
                url: `${MINECRAFT_RESOURCES_URL}/${hash.substring(0, 2)}/${hash}`,
                type: 'asset',
                sha1: hash,
                path: `${this.instances.getPath("mcAssets")}/objects/${hash.substring(0, 2)}/${hash}`,
                legacyPath: `${this.instances.getPath("mcAssets")}/virtual/legacy/${key}`,
                resourcesPath: `/${this.path}/resources/${key}`
            })
        );

        let minecraftArtifact = {
            url: manifest.downloads.client.url,
            sha1: manifest.downloads.client.sha1,
            path: `${this.instances.getPath('mcVersions')}/${manifest.id}.jar`
        };

        let libraries = [];
        if (loader.type === 'fabric') {
            const { mainClass, libraries: flibraries } = await this.instances.getFabricManifest(loader);
            const fabricLibraries = Util.mapLibraries(flibraries, this.instances.getPath("libraries"));
            libraries = libraries.concat(fabricLibraries);
            manifest.mainClass = mainClass;
        } else if (loader.type === 'forge') {
            const manifestPath = `${this.instances.getPath('libraries')}/net/minecraftforge/${loader.game}-${loader.version}/${loader.game}-${loader.version}.json`;
            if(!await Util.fileExists(manifestPath))
                await this.instances.installLoader(this, toastId, toastHead, true);

            const forgeManifest = JSON.parse(
                await Util.readTextFile(manifestPath)
            );
            if (gt(coerce(loader.game), coerce('1.5.2'))) {
                const getForgeLastVer = ver => Number.parseInt(ver.split('.')[ver.split('.').length - 1], 10);
                if (
                    lt(coerce(loader.version), coerce('10.13.1')) &&
                    gte(coerce(loader.version), coerce('9.11.1')) &&
                    getForgeLastVer(loader.version) < 1217 &&
                    getForgeLastVer(loader.version) > 935
                ) {

                }

                const forgeLibraries = Util.mapLibraries(
                    forgeManifest.version.libraries,
                    this.instances.getPath('libraries')
                );
                libraries = libraries.concat(forgeLibraries);
                manifest.mainClass = forgeManifest.version.mainClass;
                if (forgeManifest.version.minecraftArguments)
                    manifest.minecraftArguments = forgeManifest.version.minecraftArguments;
                else if (forgeManifest.version.arguments.game) {
                    if (forgeManifest.version.arguments.jvm) {
                        manifest.forge = { arguments: {} };
                        manifest.forge.arguments.jvm = forgeManifest.version.arguments.jvm.map(
                            arg => {
                                return arg
                                    .replace(/\${version_name}/g, manifest.id)
                                    .replace(
                                        /=\${library_directory}/g,
                                        "=\"../../libraries\""//`="${this.instances.getPath('libraries')}"`
                                    )
                                    .replace(
                                        /\${library_directory}/g,
                                        "../../libraries"//this.instances.getPath('libraries')
                                    )
                                    .replace(
                                        /\${classpath_separator}/g,
                                        Util.platform === 'win32' ? ';' : ':'
                                    );
                            }
                        );
                    }
                    manifest.arguments.game = manifest.arguments.game.concat(
                        forgeManifest.version.arguments.game
                    );
                }
            } else
                minecraftArtifact = {
                    path: `${this.instances.getPath('mcVersions')}/${loader.game}-${loader.version}`
                };
        }
        libraries = Util.removeDuplicates(
            libraries.concat(Util.mapLibraries(manifest.libraries, this.instances.getPath('libraries'))),
            'url'
        );

        updateToastState("Verifying Resources");

        const missing = [];
        for (const resource of [...libraries, ...assets])
            if(!await Util.fileExists(resource.path))
                missing.push(resource);
        console.log(missing);

        if(missing.length > 0)
            await this.instances.downloadLibraries(
                missing,
                updateToastState
            ).then(_ => this.instances.extractNatives(
                missing,
                this.path
            ));

        if (!await Util.fileExists(`${this.path}/natives/`)) {
            updateToastState("Extracting Natives");
            
            await this.instances.extractNatives(
                libraries,
                this.path
            );
        }

        const javaPath = await this.instances.java.getExecutable(manifest.javaVersion.majorVersion, updateToastState);
        const javaArguments = [];
        const getJvmArguments = manifest.assets !== 'legacy' &&
            gte(coerce(manifest.assets), coerce('1.13')) ?
            Util.modernGetJVMArguments : Util.getJVMArguments;

        updateToastState("Checking Authorization");
        const account = await API.Minecraft.getAccount();

        updateToastState("Launching Minecraft");
        const jvmArguments = getJvmArguments(
            libraries,
            minecraftArtifact,
            this.path.replace(/\/+|\\+/g, "/"),
            this.instances.getPath('mcAssets'),
            manifest,
            account,
            4000,
            {
                width: 600,
                height: 500
            },
            false,
            javaArguments
        ).map(v => v.toString().replaceAll(this.instances.dataController.dataPath, "../../"));

        const window = tauri.window.getCurrent();

        console.log(javaPath, jvmArguments.map(value =>
            value.toString()
        ).join(" "));

        const { sha1: loggingHash, id: loggingId } = manifest?.logging?.client?.file ?? {};
        console.log(this.instances.dataController.dataPath);
        await tauri.invoke('launch_minecraft', {
            cwd: this.path,
            window,
            javaPath: javaPath.replace(/\/+|\\+/g, "\\"),
            args: jvmArguments.map(value =>
                value.toString()
                    //.replace(...replaceRegex)
                    .replace(
                        // eslint-disable-next-line no-template-curly-in-string
                        '-Dlog4j.configurationFile=${path}',
                        `-Dlog4j.configurationFile="${this.instances.getPath('mcAssets')}/objects/${loggingHash.substring(0, 2)}/${loggingId}"`
                    )
            )
        });
        
        this.setState(null);
        toast.success(`${toastHead}\nMinecraft has launched!`, {
            id: toastId,
            duration: 3000
        });
    }

    getClientPath() {
        const { loader } = this.config;
        return `${this.instances.getPath('mcVersions')}/${loader.game}.jar`;
    }

    installMods(toastId, toastHead, concurrency) {
        return this.modpack.installMods(this, toastId, toastHead, concurrency);
    }

    setState(state) {
        this.state = state;
        this.emit('changed');
    }

    async getConfig() {
        const path = `${this.path}/config.json`;
        let config;
        if(await Util.fileExists(path))
            config = await Util.readTextFile(path).then(JSON.parse);
        else
            config = await Util.writeFile(
                path,
                JSON.stringify(DEFAULT_INSTANCE_CONFIG)
            ).then(_ => DEFAULT_INSTANCE_CONFIG);
        return this.saveConfig(this._updateConfig(config, DEFAULT_INSTANCE_CONFIG));
    }

    saveConfig(config) {
        this.config = config;
        return Util.writeFile(
            `${this.path}/config.json`,
            JSON.stringify(config)
        ).then(_ => config);
    }

    _updateConfig(config, def) {
        let defaultKeys = Object.keys(def);
        for (let i = 0; i < defaultKeys.length; i++) {
            let configValue = config[defaultKeys[i]];
            let defaultValue = def[defaultKeys[i]];
            if (defaultValue !== undefined && configValue === undefined) {
                config[defaultKeys[i]] = def[defaultKeys[i]];
            } else if (typeof configValue == "object") {
                this._updateConfig(configValue, defaultValue);
            }
        }
        this.config = config;
        return config;
    }
}

export default class Instances extends EventEmitter {
    constructor(dataController, dataPath, java) {
        super();
        this.dataController = dataController;
        this.instances = [];
        this.dataPath = dataPath;
        this.java = java;

        const window = tauri.window.getCurrent();
        window.listen("minecraft_log", ([type, text]) => {
            console.log(type, text);
            switch(type) {
                default:
                case "info":
                    console.log(text);
                    break;
            }
        });
    }

    static async build() {
        const dataPath = `${DataController.dataPath}/instances`;
        if(!await Util.fileExists(dataPath))
            await Util.createDir(dataPath);
        return new Instances(DataController, dataPath, await Java.build());
    }

    async installModpack(modpack) {
        const toastHead = `Installing ${modpack.name}`;
        const toastId = toast.loading(`${toastHead}\nFetching Info`, {
            className: 'gotham',
            position: 'bottom-right',
            duration: Infinity,
            style: { whiteSpace: 'pre-wrap' }
        });

        const func = text => {
            toast(`${toastHead}\n${text}`, {
                id: toastId
            });
        };
        func.id = toastId, func.head = toastHead;
        return modpack.install(this, func);
    }

    async installLoader(instance, toastId, toastHead, skipDone) {
        const updateToastState = typeof toastId == 'function' ? toastId : text => {
            instance.setState(text);
            if (toastId)
                toast(`${toastHead}\n${text}`, {
                    id: toastId
                });
        };
        const { loader } = await instance.getConfig();
        let libraries = {};
        switch (loader.type) {
            case 'vanilla':

                break;
            case 'forge':
                updateToastState("Downloading Forge (0%)");

                const forge = {};
                let tempForgeInstaller = await Util.downloadFile(
                    `${FORGE_MAVEN_BASE_URL}/${loader.game}-${loader.version}/forge-${loader.game}-${loader.version}-installer.jar`,
                    this.getPath('temp')
                );
                let directory = await Util.createDirAll(`${this.getPath('installers')}/forge/${loader.game}`);
                let forgeInstaller = await Util.copyFile(
                    tempForgeInstaller,
                    `${directory}/forge-${loader.game}-${loader.version}-installer.jar`
                );
                updateToastState("Downloading Forge (50%)");

                //Install Profile
                let installProfilePath = await Util.extractFile(
                    forgeInstaller,
                    'install_profile.json',
                    `${this.getPath('temp')}/install_profile.json`
                );
                let installProfile = JSON.parse(await Util.readTextFile(installProfilePath));
                if (installProfile.install) {
                    forge.install = installProfile.install;
                    forge.version = installProfile.versionInfo;
                } else {
                    forge.install = installProfile;

                    let installJSONPath = await Util.extractFile(
                        forgeInstaller,
                        installProfile.json.replace(/\//g, ''),
                        `${this.getPath('temp')}/installProfile.json`
                    );
                    forge.version = JSON.parse(await Util.readTextFile(installJSONPath));
                    await Util.removeFile(installJSONPath);
                }
                await Util.removeFile(installProfilePath);
                await Util.createDirAll(`${this.getPath('libraries')}/net/minecraftforge/${loader.game}-${loader.version}`);
                await Util.writeFile(
                    `${this.getPath('libraries')}/net/minecraftforge/${loader.game}-${loader.version}/${loader.game}-${loader.version}.json`,
                    JSON.stringify(forge)
                );

                updateToastState("Downloading Forge (90%)");

                let skipForgeFilter = true;
                if (forge.install.filePath) {
                    await Util.createDirAll(`${this.getPath('libraries')}/${forge.install.path.replace(/:/g, '/')}`);
                    await Util.extractFile(
                        forgeInstaller,
                        forge.install.filePath,
                        `${this.getPath('libraries')}/${forge.install.path.replace(/:/g, '/')}/${forge.install.filePath.split("\\").reverse()[0]}`
                    );
                } else if (forge.install.path) {
                    //await Util.createDirAll(`${this.dataController.dataPath}/libraries/${forge.install.path.replace(/:/g, '/')}`);
                    const split = Util.mavenToString(forge.install.path).split("/");
                    split.pop();

                    const location = split.join("/");
                    await Util.extractFiles(
                        forgeInstaller,
                        `maven/${path.dirname(Util.mavenToString(forge.install.path))}`,
                        `${this.getPath('libraries')}/${location}`
                    );
                } else
                    skipForgeFilter = false;

                updateToastState("Downloading Libraries");

                libraries = forge.version.libraries;
                if (forge.install.libraries)
                    libraries = libraries.concat(forge.install.libraries);

                libraries = Util.mapLibraries(
                    libraries.filter(
                        value => !skipForgeFilter ||
                            (
                                !value.name.includes('net.minecraftforge:forge:') &&
                                !value.name.includes('net.minecraftforge:minecraftforge:')
                            )
                    ),
                    this.getPath('libraries')
                );

                console.log(forge.install.processors);
                if (forge.install?.processors?.length)
                    await this.patchForge(instance, loader, forge.install, updateToastState);

                await this.downloadLibraries(libraries, updateToastState);

                break;
            case 'fabric':
                updateToastState("Reading Fabric Manifest");

                const manifest = await this.getFabricManifest(loader);
                console.log(manifest);

                libraries = Util.mapLibraries(manifest.libraries, this.getPath("libraries"));

                await this.downloadLibraries(libraries, updateToastState);

                break;
            default:
                throw new Error("What?");
        };

        instance.setState(null);
        if (toastId && !skipDone)
            toast.success(`${typeof toastId === "function" ? toastId.head : toastHead}\nSuccess!`, {
                id: typeof toastId === "function" ? toastId.id : toastId,
                duration: 3000
            });
    }

    async getFabricManifest(loader) {
        const manifestPath = `${this.getPath("libraries")}/net/fabricmc/${loader.game}/${loader.version}/fabric.json`;
        if(await Util.fileExists(manifestPath))
            return await Util.readTextFile(manifestPath).then(JSON.parse);
        else
            return API.Fabric.getVersionManifest(loader.game, loader.version).then(async manifest => {
                await Util.writeFile(manifestPath, JSON.stringify(manifest));
                return manifest;
            });
    }

    async patchForge(instance, loader, forge, update) {
        console.log('patching forge', loader, forge);
        update(`Processing Forge`);
        const universalPath = forge.libraries.find(v =>
            (v.name ?? '').startsWith('net.minecraftforge:forge')
        )?.name;
        await Util.extractFile(
            `${this.getPath('installers')}/forge/${loader.game}/forge-${loader.game}-${loader.version}-installer.jar`,
            "data/client.lzma",
            `${this.getPath("libraries")}/${Util.mavenToString(
                forge.path ?? universalPath,
                '-clientdata',
                '.lzma'
            )}`
        );
        console.log('extracted file');

        const mainJar = `${this.getPath("mcVersions")}/${forge.minecraft}.jar`;
        const mcJsonPath = `${this.getPath("mcVersions")}/${forge.minecraft}.json`;
        const installerPath = `${this.getPath("installers")}/forge/${loader.game}/forge-${loader.game}-${loader.version}-installer.jar`;
        const librariesPath = this.getPath("libraries");

        const { processors } = forge;
        const replaceIfPossible = arg => {
            const finalArg = arg.replace('{', '').replace('}', '');
            if (forge.data[finalArg]) {
                if (finalArg === 'BINPATCH')
                    return `"${Util.mavenToString(
                        forge.path ?? universalPath
                    ).replace('.jar', '-clientdata.lzma')}"`;
                return forge.data[finalArg].client;
            }
            return arg
                .replace('{SIDE}', `client`)
                .replace('{ROOT}', `"${installerPath}"`)
                .replace('{MINECRAFT_JAR}', `"${mainJar}"`)
                .replace('{MINECRAFT_VERSION}', `"${mcJsonPath}"`)
                .replace('{INSTALLER}', `"${installerPath}"`)
                .replace('{LIBRARY_DIR}', `"${librariesPath}"`);
        };
        const computePathIfPossible = arg => {
            if (arg[0] === '[')
                return `${librariesPath}/${Util.mavenToString(
                    arg.replace('[', '').replace(']', '')
                )}`;
            return arg;
        };
        const javaPath = await this.java.getExecutable(8, update);
        console.log(javaPath);

        let counter = 1;
        console.log(counter, processors);
        for (const key in processors) {
            console.log(key);
            if (Object.prototype.hasOwnProperty.call(processors, key)) {
                const p = processors[key];
                if (p?.sides && !(p?.sides || []).includes('client'))
                    continue;
                console.log(p);
                const filePath = `${librariesPath}/${Util.mavenToString(p.jar)}`;
                const args = p.args
                    .map(arg => replaceIfPossible(arg))
                    .map(arg => computePathIfPossible(arg));

                const classPaths = p.classpath.map(
                    cp => `"${librariesPath}/${Util.mavenToString(cp)}"`
                );

                const mainClass = await Util.readJarManifest(filePath, 'Main-Class');
                await tauri.invoke('launch_java', {
                    javaPath: javaPath.replace(/\/+|\\+/g, "\\"),
                    args: [
                        '-cp',
                        [`"${filePath}"`, ...classPaths].join(";"),
                        mainClass,
                        ...args
                    ],
                    cwd: librariesPath
                });
                update(`Processing Forge (${counter}/${processors.length})`);
                counter++;
            }
        }
    }

    async installInstanceWithLoader(name, loader, gameVersion, loaderVersion) {
        console.log(loader, gameVersion, loaderVersion);
        const toastHead = `Setting-Up ${name}`;
        const toastId = toast.loading(`${toastHead}\nSetting up Instance`, {
            className: 'gotham',
            position: 'bottom-right',
            duration: Infinity,
            style: { whiteSpace: 'pre-wrap' }
        });

        const instance = await Instance.build({
            name,
            path: `${this.getPath("instances")}/${name}`
        }, this);
        instance.on('changed', _ => this.emit('changed'));

        const config = await instance.getConfig();
        config.loader.type = loader;
        config.loader.game = gameVersion;
        config.loader.version = loaderVersion.includes("-") ? loaderVersion.split("-")[1] : loaderVersion;

        config.modifications = [];
        await instance.saveConfig(config);
        this.instances.unshift(instance);

        await Util.createDir(`${instance.path}/mods`);

        await this.installLoader(instance, toastId, toastHead);

        instance.mods = [];
        instance.corrupt = false;
        instance.setState(null);
    }

    async downloadLibraries(libraries, updateToastState, concurrency = 10) {
        let downloaded = 0;
        return pMap(
            libraries,
            async library => {
                if (!library.path || !library.url)
                    return console.warn("Skipping Library", library);

                let ok = false;
                let tries = 0;
                do {
                    tries++;
                    if (tries !== 1)
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    try {
                        const checkForgeMatch = str => {
                            const forgeMatch = str.match(/(.*)(forge-\d)(.*)(\d)/g);
                            if(forgeMatch)
                                str = [...forgeMatch, "-universal.jar"].join("");
                            if(str.startsWith("https://files.minecraftforge.net/"))
                                str = str.replace("files.", "maven.");
                            return str;
                        };
                        library.url = checkForgeMatch(library.url);
                        library.path = checkForgeMatch(library.path);

                        return Util.downloadFilePath(encodeURI(library.url), library.path, true)
                            .then(_ => updateToastState?.(`Downloading Libraries (${downloaded += 1}/${libraries.length})`));
                    } catch (err) {
                        console.error(err);
                    }
                } while (!ok && tries <= 3);
                return;
            },
            { concurrency }
        );
    }

    async installMinecraft(version, instance, updateToastState) {
        console.log("Installing Minecraft");
        updateToastState?.("Installing Minecraft");
        const versionManifest = await JSON.parse(
            await Util.readTextFile(`${this.getPath("mcVersions")}/${version}.json`).catch(async _ => {
                updateToastState?.("Downloading Manifest");
                const manifestVersionsPath = await Util.downloadFile(
                    MINECRAFT_VERSION_MANIFEST,
                    this.getPath('temp')
                );
                const { versions } = JSON.parse(await Util.readTextFile(manifestVersionsPath));
                const targetManifest = versions.find(manifest => manifest.id === version);
                if (!targetManifest)
                    throw new Error(`Could not find manifest for ${version}`);

                return Util.downloadFile(
                    targetManifest.url,
                    `${this.getPath('libraries')}/minecraft`
                ).then(path => Util.readTextFile(path));
            })
        );

        const assetsJson = await JSON.parse(
            await Util.readTextFile(`${this.getPath('mcAssets')}/indexes/${versionManifest.assets}.json`).catch(async _ => {
                updateToastState?.("Downloading Assets Manifest");
                return Util.downloadFile(
                    versionManifest.assetIndex.url,
                    `${this.getPath('mcAssets')}/indexes`
                ).then(path => Util.readTextFile(path));
            })
        );

        updateToastState?.("Reading Manifests");
        const assets = Object.entries(assetsJson.objects).map(
            ([key, { hash }]) => ({
                url: `${MINECRAFT_RESOURCES_URL}/${hash.substring(0, 2)}/${hash}`,
                type: 'asset',
                sha1: hash,
                path: `${this.getPath("mcAssets")}/objects/${hash.substring(0, 2)}/${hash}`,
                legacyPath: `${this.getPath("mcAssets")}/virtual/legacy/${key}`,
                resourcesPath: `/${this.path}/resources/${key}`
            })
        );

        const libraries = Util.mapLibraries(
            versionManifest.libraries,
            this.getPath('libraries')
        );

        const clientArtifact = {
            url: versionManifest.downloads.client.url,
            sha1: versionManifest.downloads.client.sha1,
            path: `${this.getPath('mcVersions')}/${versionManifest.id}.jar`
        };

        if (versionManifest.logging) {
            updateToastState?.("Downloading Logging");
            const {
                id,
                url,
                sha1
            } = versionManifest.logging.client.file;
            await Util.downloadFile(
                url,
                `${this.getPath('mcAssets')}/objects/${sha1.substring(0, 2)}/${id}`
            );
        }

        updateToastState?.("Downloading Libraries");
        await this.downloadLibraries(
            [...libraries, ...assets, clientArtifact],
            updateToastState
        );

        await this.extractNatives(
            libraries,
            instance.path
        );

        updateToastState?.(null);
    }

    async extractNatives(libraries, path) {
        return Promise.all(
            libraries.filter(lib => lib.natives)
            .map(library =>
                Util.extractFiles(library.path, '', `${path}/natives`, 'META-INF')
            )
        );
    }

    getLatestModpackFile(files) {
        let date = 0, file = null;
        for (let i = 0; i < files.length; i++) {
            let value = files[i];
            if (new Date(value.gameVersionDateReleased) > date)
                file = value;
        }
        return file;
    }

    static getLatestMod(files) {
        let date = 0, file = null;
        for (let i = 0; i < files.length; i++) {
            let value = files[i];
            if (new Date(value.fileDate) > date)
                file = value;
        }
        return file;
    }

    async getInstances() {
        const directory = await Util.readDir(this.dataPath);
        const instances = this.instances;
        for (const file of directory) {
            if (!instances.find(inst => inst.name === file.name)) {
                const instance = await Instance.build(file, this);
                instance.init();
                instance.mods = await instance.getMods().catch(console.error);

                if(!instance.mods)
                    instance.corrupt = true, instance.state = "Unavailable";

                instance.on('changed', _ => this.emit('changed'));
                instances.unshift(instance);
            }
        }
        return instances;
    }

    getPath(name) {
        const base = this.dataController.dataPath;
        switch (name) {
            case 'instances':
                return `${base}instances`;
            case 'libraries':
                return `${base}libraries`;
            case 'mcAssets':
                return `${base}assets`;
            case 'mcVersions':
                return `${base}libraries/minecraft`;
            case 'installers':
                return `${base}installers`;
            case 'temp':
                return `${base}temp`;
            default:
                return null;
        };
    }
}