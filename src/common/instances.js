import pMap from 'p-map-browser';
import { Buffer } from 'buffer/';
import * as tauri from '@tauri-apps/api';
import path from 'path-browserify';
import toast from 'react-hot-toast';
import { create } from 'xmlbuilder2';

import gte from 'semver/functions/gte';
import coerce from 'semver/functions/coerce';

import API from './api';
import Util from './util';
import Java from './java';
import EventEmitter from './lib/EventEmitter';
import DataController from './dataController';
import { APINames, LoaderData, LoaderTypes, PlatformIndex, MINECRAFT_VERSION_MANIFEST, MINECRAFT_RESOURCES_URL } from './constants';

import {
    FORGE_MAVEN_BASE_URL
} from './constants';

const DEFAULT_INSTANCE_CONFIG = {
    loader: {
        type: "vanilla",
        game: "0.0.0"
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
        this.downloading = [];
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
            await Util.readTextFile(modCachePath).then(JSON.parse) : {};

        const modsPath = `${this.path}/mods`;
        if(!await Util.fileExists(modsPath))
            return [];

        const files = await Util.readDir(modsPath);
        const mods = [];
        for (const { name, path } of files) {
            if (!name.endsWith(".jar"))
                continue;
            if (modCache[name]) {
                mods.unshift({ ...modCache[name], path });
                continue;
            }

            const mod = await this.readMod(path);
            if(mod) {
                mods.unshift(mod);
                modCache[name] = mod;
                continue;
            }
            if(!modCache[name]) {
                modCache[name] = {
                    id: "error",
                    name,
                    path,
                    loader: "error",
                    description: "error",
                    version: "error"
                };
                mods.unshift(modCache[name]);
            }
        }
        if(Object.keys(modCache).length > 0)
            await Util.writeFile(modCachePath, JSON.stringify(modCache));

        return mods.map(mod => {
            mod.source = this.config.modifications.find(m => m[4] === mod.id)?.[0];
            return mod;
        });
    }

    async readMod(path) {
        const forgeData = await Util.readFileInZip(path, "mcmod.info").catch(_ => null);
        if (forgeData)
            try {
                const parsedData = JSON.parse(forgeData);
                const { logoFile, modid, name: modName, description, mcversion, version } = parsedData.modList?.[0] ?? parsedData[0];
                const mod = {
                    id: modid,
                    name: modName,
                    path,
                    loader: "forge",
                    description,
                    gameVersion: mcversion,
                    version
                };
                const image = await Util.readBinaryInZip(path, logoFile).catch(console.warn);
                if (image)
                    mod.icon = Buffer.from(image).toString('base64');

                return mod;
            } catch(err) { console.warn(err) }

        const fabricData = await Util.readFileInZip(path, "fabric.mod.json").catch(_ => null);
        if(fabricData)
            try {
                const { id, jars, icon, name: modName, description, depends, version } = JSON.parse(fabricData);
                const mod = {
                    id,
                    name: modName,
                    path,
                    loader: "fabric",
                    embedded: [],
                    description,
                    gameVersion: depends?.minecraft,
                    version
                };
                const image = await Util.readBinaryInZip(path, icon ?? `assets/${id}/textures/icon.png`).catch(console.warn);
                if(image)
                    mod.icon = Buffer.from(image).toString('base64');
                if(Array.isArray(jars))
                    for(const { file } of jars) {
                        const output = `${this.instances.getPath('temp')}/${modName}-${file.split(/\/+|\\+/).reverse()[0]}`;
                        await Util.extractFile(path, file, output);
                        mod.embedded.push(await this.readMod(output));

                        await Util.removeFile(output);
                    }

                return mod;
            } catch(err) { console.warn(err) }

        const quiltData = await Util.readFileInZip(path, "quilt.mod.json").catch(_ => null);
        if(quiltData)
            try {
                const { id, depends, version, metadata } = JSON.parse(quiltData).quilt_loader;
                const mod = {
                    id,
                    name: metadata.name,
                    path,
                    loader: "quilt",
                    description: metadata.description,
                    gameVersion: depends.minecraft,
                    version
                };
                const image = await Util.readBinaryInZip(path, metadata.icon).catch(console.warn);
                if (image)
                    mod.icon = Buffer.from(image).toString('base64');

                return mod;
            } catch(err) { console.warn(err) }
    }

    isJava() {
        return LoaderTypes[this.config?.loader.type]?.includes('java');
    }

    isBedrock() {
        return LoaderTypes[this.config?.loader.type]?.includes('bedrock');
    }

    isVanilla() {
        return LoaderTypes[this.config?.loader.type]?.includes('vanilla');
    }

    isModded() {
        return LoaderTypes[this.config?.loader.type]?.includes('modded');
    }

    async launch(account) {
        if(!account)
            throw new Error('Account Required');
        this.launchLogs = [];

        const toastHead = `Launching ${this.name}`;
        const toastId = toast.loading(`${toastHead}\nPreparing`, {
            className: 'gotham',
            position: 'bottom-right',
            duration: 10000,
            style: { whiteSpace: 'pre-wrap' }
        });

        const updateToastState = text => {
            this.setState(text);
            toast(`${toastHead}\n${text}`, {
                id: toastId
            });
        };

        const { loader } = await this.getConfig();
        const isJava = this.isJava(), isBedrock = this.isBedrock();
        if (!await Util.fileExists(this.getClientPath()))
            await this.instances.installMinecraft(loader.game, this, updateToastState);
        if(isJava || !isBedrock) {
            updateToastState("Reading Minecraft Manifest");

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
                    resourcesPath: `${this.path}/resources/${key}`
                })
            );

            let minecraftArtifact = {
                url: manifest.downloads.client.url,
                sha1: manifest.downloads.client.sha1,
                path: `${this.instances.getPath('mcVersions')}/${manifest.id}.jar`
            };

            let libraries = [];
            if(!Util.getLoaderType(loader.type).includes('vanilla')) {
                updateToastState(`Modifying Launch Info for ${Util.getLoaderName(loader.type)}`);
                const loaderManifestPath = `${this.instances.getPath('versions')}/${loader.type}-${loader.game}-${loader.version}/manifest.json`;
                if(!await Util.fileExists(loaderManifestPath))
                    await this.instances.installLoader(this, toastId, toastHead, true);
                
                const loaderManifest = await Util.readTextFile(loaderManifestPath).then(JSON.parse);
                libraries = libraries.concat(
                    Util.mapLibraries(loaderManifest.libraries, this.instances.getPath("libraries"))
                );
                manifest.mainClass = loaderManifest.mainClass;

                if(loaderManifest.arguments?.game)
                    for (const argument of loaderManifest.arguments.game)
                        manifest.arguments.game.push(argument);
                /*if(loaderManifest.arguments?.jvm)
                    manifest.arguments.jvm = manifest.arguments.jvm.concat(
                        loaderManifest.arguments.jvm.map(arg =>
                            arg.replace(/\${version_name}/g, manifest.id)
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
                                ).replace(/ += +/g, '=')
                        )
                    );*/
            }
            /*switch(loader.type) {
                case 'fabric':
                    updateToastState("Reading Fabric Manifest");
                    const { mainClass: fabricMainClass, libraries: flibraries } = await this.instances.getFabricManifest(loader);
                    const fabricLibraries = Util.mapLibraries(flibraries, this.instances.getPath("libraries"));
                    libraries = libraries.concat(fabricLibraries);
                    manifest.mainClass = fabricMainClass;
                    break;
                case 'quilt':
                    updateToastState("Reading Quilt Manifest");
                    const { mainClass: quiltMainClass, libraries: qlibraries } = await this.instances.getQuiltManifest(loader);
                    const quiltLibraries = Util.mapLibraries(qlibraries, this.instances.getPath("libraries"));
                    libraries = libraries.concat(quiltLibraries);
                    manifest.mainClass = quiltMainClass;
                    break;
                case 'forge':
                    updateToastState("Reading Forge Manifest");
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
                    break
            }*/
            libraries = Util.removeDuplicates(
                libraries.concat(Util.mapLibraries(manifest.libraries, this.instances.getPath('libraries'))),
                'url'
            );

            updateToastState("Verifying Resources");

            const missing = [];
            for (const resource of [...libraries, ...assets])
                if(!await Util.fileExists(resource.path) || (assetsJson.map_to_resources && resource.resourcesPath && !await Util.fileExists(resource.resourcesPath)))
                    missing.push(resource);

            if(missing.length > 0)
                await this.instances.downloadLibraries(
                    missing,
                    updateToastState
                ).then(_ => this.instances.extractNatives(
                    missing,
                    this.path
                ));
            if(assetsJson.map_to_resources) {
                updateToastState?.("Copying Assets to Legacy Resources");
                for (const asset of missing)
                    if(asset.resourcesPath)
                        await Util.copyFile(asset.path, asset.resourcesPath);
            }

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

            updateToastState("Authorizing");
            const ownsMinecraft = await API.Minecraft.ownsMinecraft(account.minecraft).catch(err => {
                console.error(err);
                toast.dismiss(toastId);
                throw new Error(`Failed to check your entitlements.\n${err.message ?? ''}`);
            });
            if(!ownsMinecraft) {
                toast.dismiss(toastId);
                throw new Error('You do not own Minecraft Java Edition');
            }

            updateToastState("Launching Minecraft");
            const jvmArguments = getJvmArguments(
                libraries,
                minecraftArtifact,
                this.path.replace(/\/+|\\+/g, "/"),
                this.instances.getPath('mcAssets'),
                manifest,
                {
                    profile: await API.Minecraft.getProfile(account.minecraft),
                    ...account.minecraft
                },
                4000,
                { width: 600, height: 500 },
                false,
                javaArguments
            ).map(v => v.toString().replaceAll(this.instances.dataController.dataPath, "../../"));
            console.log(jvmArguments);

            const window = tauri.window.getCurrent();

            const { sha1: loggingHash, id: loggingId } = manifest?.logging?.client?.file ?? {};
            const logger = await tauri.invoke('launch_minecraft', {
                cwd: this.path,
                window,
                javaPath: javaPath.replace(/\/+|\\+/g, "\\"),
                args: jvmArguments.map(value =>
                    value.toString()
                        //.replace(...replaceRegex)
                        .replace(
                            // eslint-disable-next-line no-template-curly-in-string
                            '-Dlog4j.configurationFile=${path}',
                            `-Dlog4j.configurationFile="${this.instances.getPath('mcAssets')}/objects/${loggingHash?.substring(0, 2)}/${loggingId}"`
                        )
                )
            });

            const splashWindow = new tauri.window.WebviewWindow(logger, {
                url: '/instance-splash',
                title: `Starting ${this.name}`,
                width: 320,
                focus: true,
                height: 160,
                center: true,
                resizable: false,
                decorations: false,
                transparent: true
            });

            let windowClosed = false;
            const updateText = text => tauri.invoke('send_window_event', {
                label: splashWindow.label,
                event: "text",
                payload: text
            });
            setTimeout(_ => {
                tauri.invoke('send_window_event', {
                    label: splashWindow.label,
                    event: "name",
                    payload: this.name
                });
                updateText("Starting Instance");
            }, 5000);

            const readOut = async(message, object, type) => {
                console.log(message, object);
                this.launchLogs.push(object ? {
                    text: message,
                    type: object['log4j:Event']['@level'],
                    logger: object['log4j:Event']['@logger'],
                    thread: object['log4j:Event']['@thread'],
                    timestamp: object['log4j:Event']['@timestamp']
                } : {
                    type: {out: 'INFO', err: 'ERROR'}[type],
                    text: message
                });
                this.emit('changed');
                if(!windowClosed)
                    if(message.startsWith("Loading Minecraft ") && message.includes(" with Fabric "))
                        updateText(`Loading Fabric ${message.split(" ")[6]} for ${message.split(" ")[2]}`);
                    else if(message.startsWith("Loading Minecraft ") && message.includes(" with Quilt Loader "))
                        updateText(`Loading Quilt Loader ${message.split(" ")[6]} for ${message.split(" ")[2]}`);
                    else if(message.startsWith("Forge Mod Loader version "))
                        updateText(`Loading Forge ${message.split(" ")[4]} for ${message.split(" ")[7]}`);
                    else if(message.startsWith("Preparing ") || message.startsWith("Initializing ") || message.startsWith("Initialized "))
                        updateText(`${message.split(" ")[0]} ${message.split(" ")[1]}`);
                    else if(message.startsWith("Bootstrap start"))
                        updateText("Starting Bootstrap");
                    else if(message.startsWith("Bootstrap in "))
                        updateText("Started Bootstrap");
                    else if(message.startsWith("Setting user"))
                        updateText("Setting User");
                    else if(message.toLowerCase().includes("lwjgl version") || message.toLowerCase().includes("openal initialized") || message.toLowerCase().includes("crashed")) {
                        windowClosed = true;
                        splashWindow.close();
                    }
            };

            let log4jString = "";
            window.listen(logger, async ({ payload }) => {
                const [type, ...split] = payload.split(':');
                const string = split.join(':');
                if(/ *<log4j:Event/.test(string))
                    log4jString = string;
                else if(/ *<\/log4j:Event>/.test(string) && log4jString) {
                    const object = create(log4jString + string).toObject({
                        prettyPrint: true
                    });
                    log4jString = "";

                    const message = object['log4j:Event']['log4j:Message']['$'];
                    if(message)
                        readOut(message, object, type);
                    log4jString = "";
                } else if(log4jString)
                    log4jString += string;
                else
                    readOut(string, null, type);
            });
        } else if(isBedrock) {
            await tauri.invoke('reregister_package', {
                family: 'Microsoft.MinecraftUWP_8wekyb3d8bbwe',
                gameDir: this.getClientPath()
            });
            await tauri.invoke('launch_package', {
                family: 'Microsoft.MinecraftUWP_8wekyb3d8bbwe',
                gameDir: this.getClientPath()
            });
        }
        
        this.setState(null);
        toast.success(`${toastHead}\nMinecraft has launched!`, {
            id: toastId,
            duration: 3000
        });
    }

    async delete() {
        await Util.removeDir(this.path);

        if(this.instances.instances.some(i => i.name === this.name))
            this.instances.instances.splice(this.instances.instances.findIndex(i => i.name === this.name), 1);
        else
            console.warn(`Couldn't find ${this.name}'s instance in instances`);
        this.instances.emit('changed');
    }

    getClientPath() {
        const { loader } = this.config;
        const isJava = this.isJava(), isBedrock = this.isBedrock();
        if(isJava || !isBedrock)
            return `${this.instances.getPath('mcVersions')}/${loader.game}.jar`;
        else if(isBedrock)
            return `${this.instances.getPath('versions')}/bedrock-${loader.game}/GameDirectory`;
    }

    installMods(toastId, toastHead, concurrency) {
        return this.modpack.installMods(this, toastId, toastHead, concurrency);
    }

    async downloadMod(id, api) {
        console.warn(`Downloading Mod ${id} via ${api.name}`);
        this.downloading.push({
            id,
            type: 'mod'
        });
        this.emit('changed');

        const config = await this.getConfig();
        try {
            const { slug, title } = await api.getProject(id);
            const versions = await api.getProjectVersions(id);
            const version = api.getCompatibleVersion(config, versions);
            if(!version)
                throw new Error(`'${title}' is incompatible with '${this.name}'.`);

            const file = version?.files?.find(f => f.primary) ?? version?.files?.[0] ?? version;
            const fileName = file.filename ?? file.fileName;
            const downloadUrl = file.url ?? file.downloadUrl;
            if(file)
                await Util.downloadFilePath(downloadUrl, `${this.path}/mods/${fileName}`, true);

            this.downloading.splice(this.downloading.findIndex(d => d.id === id), 1);
            if(!file)
                throw new Error('File invalid.');
            
            const mod = await this.readMod(`${this.path}/mods/${fileName}`);
            if(mod)
                this.mods.push({ source: api.SOURCE_NUMBER, ...(mod ?? {
                    id: "error",
                    name: fileName ?? title,
                    loader: "error",
                    description: "error",
                    version: "error"
                })});
            config.modifications.push([api.SOURCE_NUMBER, id, version.id, slug, mod?.id ?? slug]);
        } catch(err) {
            console.error(err);
            toast.error(`Failed to download ${id}.\n${err.message ?? 'Unknown Reason.'}`);
            
            const index = this.downloading.findIndex(d => d.id === id);
            if(index >= 0)
                this.downloading.splice(index, 1);
            this.emit('changed');
            return false;
        }

        await this.saveConfig(config);
        this.emit('changed');

        console.warn(`Downloaded Mod ${id}`);
        return true;
    }

    async downloadMods(concurrency = 20) {
        let downloaded = 0;

        return pMap(
            this.config.modifications,
            async([source, id, versionId]) => {
                this.setState(`Downloading Mods ${downloaded + 1}/${this.config.modifications.length}`);
                const api = API[APINames[PlatformIndex[source]]];
                const { title } = await api.getProject(id);
                const version = await api.getProjectVersion(versionId, id);
                const file = version?.files?.find(f => f.primary) ?? version?.files?.[0] ?? version;
                const fileName = file.filename ?? file.fileName;
                const downloadUrl = file.url ?? file.downloadUrl;
                if(file)
                    await Util.downloadFilePath(downloadUrl, `${this.path}/mods/${fileName}`, true);
                this.downloading.splice(this.downloading.findIndex(d => d.id === id), 1);

                const mod = await this.readMod(`${this.path}/mods/${fileName}`);
                if(mod)
                    this.mods.push({ source: api.SOURCE_NUMBER, ...(mod ?? {
                        id: "error",
                        name: fileName ?? title,
                        loader: "error",
                        description: "error",
                        version: "error"
                    })});
                downloaded++;
            },
            { concurrency }
        );
    }

    async deleteMod(id) {
        const mod = this.mods.find(mod => mod.id === id);
        if(!mod)
            return console.warn(`Mod Deletion of ${id} failed, doesn't exist.`);
        console.warn(`Deleting Mod ${id}`);

        await Util.removeFile(mod.path);
        const config = await this.getConfig();
        if(config.modifications.some(m => m[4] === id))
            config.modifications.splice(config.modifications.findIndex(m => m[4] === id), 1);

        await this.saveConfig(config);

        if(this.mods.some(m => m.id === id))
            this.mods.splice(this.mods.findIndex(m => m.id === id), 1);

        this.emit('changed');
        console.warn(`Deleted Mod ${id}`);
        return true;
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
        return this.saveConfig(config);
    }

    saveConfig(config) {
        this.config = config;
        return Util.writeFile(
            `${this.path}/config.json`,
            JSON.stringify(config)
        ).then(_ => config);
    }
}

class Instances extends EventEmitter {
    constructor(dataController, dataPath, java) {
        super();
        this.dataController = dataController;
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
        const loaderDir = `${this.getPath('versions')}/${loader.type}-${loader.game}-${loader.version}`;
        updateToastState(`Installing ${Util.getLoaderName(loader.type)} ${loader.version ?? loader.game}`);

        let libraries = {};
        switch (loader.type) {
            case 'java':
            case 'bedrock':
                break;
            case 'forge':
                updateToastState("Downloading Forge (0%)");

                const forge = {};
                const tempForgeInstaller = await Util.downloadFile(
                    `${FORGE_MAVEN_BASE_URL}/${loader.game}-${loader.version}/forge-${loader.game}-${loader.version}-installer.jar`,
                    this.getPath('temp')
                );
                const directory = await Util.createDirAll(`${this.getPath('installers')}/forge/${loader.game}`);
                const forgeInstaller = await Util.copyFile(
                    tempForgeInstaller,
                    `${directory}/forge-${loader.game}-${loader.version}-installer.jar`
                );
                updateToastState("Downloading Forge (50%)");

                //Install Profile
                const installProfilePath = await Util.extractFile(
                    forgeInstaller,
                    'install_profile.json',
                    `${this.getPath('temp')}/install_profile.json`
                );
                const installProfile = JSON.parse(await Util.readTextFile(installProfilePath));
                if (installProfile.install) {
                    forge.install = installProfile.install;
                    forge.version = installProfile.versionInfo;
                } else {
                    forge.install = installProfile;

                    const installJSONPath = await Util.extractFile(
                        forgeInstaller,
                        installProfile.json.replace(/\//g, ''),
                        `${this.getPath('temp')}/installProfile.json`
                    );
                    forge.version = JSON.parse(await Util.readTextFile(installJSONPath));
                    await Util.removeFile(installJSONPath);
                }
                await Util.removeFile(installProfilePath);
                await Util.createDirAll(loaderDir);
                await Util.writeFile(
                    `${this.getPath('versions')}/net/minecraftforge/${loader.game}-${loader.version}/${loader.game}-${loader.version}.json`,
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

                if (forge.install?.processors?.length)
                    await this.patchForge(instance, loader, forge.install, updateToastState);

                await this.downloadLibraries(libraries, updateToastState);

                break;
            /*case 'quilt':
                updateToastState("Reading Quilt Manifest");
                const quiltManifest = await this.getQuiltManifest(loader);
                console.log(quiltManifest);

                libraries = Util.mapLibraries(quiltManifest.libraries, this.getPath("libraries"));

                await this.downloadLibraries(libraries, updateToastState);

                break;
            case 'fabric':
                updateToastState("Reading Fabric Manifest");

                const fabricManifest = await this.getFabricManifest(loader);
                console.log(fabricManifest);

                libraries = Util.mapLibraries(fabricManifest.libraries, this.getPath("libraries"));

                await this.downloadLibraries(libraries, updateToastState);

                break;*/
            default:
                const manifestPath = `${loaderDir}/manifest.json`;
                if(!await Util.fileExists(manifestPath)) {
                    const loaderData = LoaderData[loader.type];
                    if(loaderData) {
                        const manifest = await API.makeRequest(
                            Util.parseString(loaderData.manifestUrl, loader.game, loader.version)
                        );
                        await Util.writeFile(manifestPath, JSON.stringify(manifest));
                    } else {
                        if(toastId)
                            toast.error(`${Util.getLoaderName(loader.type)} isn't supported by mdpkm!`, {
                                position: 'bottom-right'
                            });
                        throw new Error(`${loader.type} ${loader.version} for ${loader.game} wasn't found.`);
                    }
                }

                const manifest = await Util.readTextFile(manifestPath).then(JSON.parse);
                await this.downloadLibraries(
                    Util.mapLibraries(manifest.libraries, this.getPath("libraries")),
                    updateToastState
                );

                break;
        };

        instance.setState(null);
        if (toastId && !skipDone)
            toast.success(`${typeof toastId === "function" ? toastId.head : toastHead}\nSuccess!`, {
                id: typeof toastId === "function" ? toastId.id : toastId,
                duration: 3000
            });
    }

    async getQuiltManifest(loader) {
        const manifestPath = `${this.getPath("versions")}/quilt-loader-${loader.game}-${loader.version}/quilt-loader-${loader.game}-${loader.version}.json`;
        if(await Util.fileExists(manifestPath))
            return await Util.readTextFile(manifestPath).then(JSON.parse);
        else
            return API.Quilt.getVersionManifest(loader.game, loader.version).then(async manifest => {
                await Util.writeFile(manifestPath, JSON.stringify(manifest));
                return manifest;
            });
    }

    async getFabricManifest(loader) {
        const manifestPath = `${this.getPath("versions")}/fabric-loader-${loader.game}-${loader.version}/fabric-loader-${loader.game}-${loader.version}.json`;
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
                }).catch(err => {throw err});
                update(`Processing Forge (${counter}/${processors.length})`);
                counter++;
            }
        }
    }

    async installInstanceWithLoader(name, loader, gameVersion, loaderVersion, setState) {
        console.log(loader, gameVersion, loaderVersion);
        const toastHead = `Setting-Up ${name}`;
        const toastId = setState ? null : toast.loading(`${toastHead}\nSetting up Instance`, {
            className: 'gotham',
            position: 'bottom-right',
            duration: Infinity,
            style: { whiteSpace: 'pre-wrap' }
        });
        setState?.('Setting up instance...');

        const instance = await Instance.build({
            name,
            path: `${this.getPath("instances")}/${name}`
        }, this);
        instance.on('changed', _ => this.emit('changed'));

        const config = await instance.getConfig();
        config.loader.type = loader;
        config.loader.game = gameVersion;
        config.loader.version = loader !== "quilt" && loaderVersion && loaderVersion.includes("-") ?
            loaderVersion.split("-")[1] : loaderVersion;

        config.modifications = [];
        await instance.saveConfig(config);

        if(loaderVersion)
            await Util.createDir(`${instance.path}/mods`);

        setState?.(`Installing ${Util.getLoaderName(loader)}...`);
        try {
            await this.installLoader(instance, toastId, toastHead);
            await this.installMinecraft(gameVersion, instance, setState);
        } catch(err) {
            console.error(err);
            return toast.error(`Failed to install ${loader} ${gameVersion}\nInstallation cancelled.`);
        }

        this.instances.unshift(instance);
        instance.mods = [];
        instance.corrupt = false;
        instance.setState(null);
        setState?.();
    }

    async importInstance() {
        const path = await tauri.dialog.open({
            filters: [{ name: 'mdpkm Instance Files', extensions: ['mdpki'] }]
        });
        if(path)
            if(path.endsWith('.mdpki')) {
                const { name } = await Util.readFileInZip(path, 'export_data.json').then(JSON.parse);
                if(this.instances.some(i => i.name === name))
                    return toast.error(`Import failed, a instance called ${name} already exists`, {
                        position: 'bottom-right'
                    });

                const instanceDir = `${this.getPath('instances')}/${name}`;
                if(!await Util.fileExists(instanceDir))
                    await Util.createDirAll(instanceDir);
                await Util.extractZip(path, instanceDir);
                await Util.removeFile(`${instanceDir}/export_data.json`);

                const instance = await Instance.build({
                    name,
                    path: instanceDir
                }, this);
                instance.on('changed', _ => this.emit('changed'));
                instance.mods = [];
                this.instances.unshift(instance);

                const { loader } = await instance.getConfig();
                if(loader?.version)
                    await Util.createDir(`${instance.path}/mods`);

                await this.installLoader(instance);
                await instance.downloadMods();

                instance.mods = await instance.getMods();
                instance.corrupt = false;
                instance.setState(null);

                toast(`Imported ${name} successfully`, {
                    position: 'bottom-right'
                });
            } else
                toast.error('Import failed, path did not lead to a export file', {
                    position: 'bottom-right'
                });
        else
            toast.error('Import failed, path was not specified', {
                position: 'bottom-right'
            });
    }

    async exportInstance(instance, files) {
        const path = await tauri.dialog.save({
            filters: [{ name: 'mdpkm Instance Files', extensions: ['mdpki'] }]
        });
        const exportData = {
            name: instance.name
        };
        for (const mod of instance.mods) {
            const file = files.findIndex(f => f.replace(/\/+|\\+/g, '/') === mod.path.replace(/\/+|\\+/g, '/'));
            const cmod = instance.config.modifications.find(m => m[3] === mod.id || m[4] === mod.id);
            if(file >= 0 && cmod)
                files.splice(file, 1);
        }
            
        const exportDataPath = `${instance.path}/export_data.json`;
        await Util.writeFile(exportDataPath, JSON.stringify(exportData));
        files.push(exportDataPath);

        await Util.createZip(path, instance.path, files);
        await Util.removeFile(exportDataPath);

        toast(`Exported ${instance.name} to ${path.split(/\/+|\\+/).reverse()[0]}`, {
            position: 'bottom-right'
        });
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

        const { loader } = await instance.getConfig();
        const isJava = instance.isJava(), isBedrock = instance.isBedrock();
        if(isJava || !isBedrock) {
            const versionManifest = await JSON.parse(
                await Util.readTextFile(`${this.getPath("mcVersions")}/${version}.json`).catch(async _ => {
                    updateToastState?.("Downloading Manifest");
                    const { versions } = await Util.makeRequest(MINECRAFT_VERSION_MANIFEST);
                    console.log(versions);
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
                    resourcesPath: `${this.path}/resources/${key}`
                })
            );
            console.log(assets);

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
            if(assetsJson.map_to_resources) {
                updateToastState?.("Copying Assets to Legacy Resources");
                for (const asset of assets)
                    await Util.copyFile(asset.path, asset.resourcesPath);
            }

            await this.extractNatives(
                libraries,
                instance.path
            );
        } else if(isBedrock) {
            updateToastState?.("Downloading Bedrock (will take a while)");

            const basePath = `${this.getPath('versions')}/bedrock-${loader.game}`;
            const gamePath = `${basePath}/GameDirectory`;
            const appPath = `${basePath}/minecraft.appx`;

            if(!await Util.fileExists(appPath)) {
                const downloadLink = await API.Minecraft.Bedrock.getDownloadLink(version);
                console.log(downloadLink);

                await Util.downloadFilePath(downloadLink, `${basePath}/minecraft.appx`, true);
            }

            updateToastState?.("Extracting minecraft.appx");
            await Util.createDirAll(gamePath);
            await Util.extractZip(appPath, gamePath);
            await Util.removeFile(`${gamePath}/AppxSignature.p7x`);
        }

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
        this.gettingInstances = true;
        this.setState('Reading Directory');

        const directory = await Util.readDir(this.dataPath);
        const instances = this.instances = this.instances || [];
        for (const file of directory)
            if (!instances.some(inst => inst.name === file.name)) {
                this.setState(`Loading ${file.name}`);
                if(!await Util.fileExists(`${file.path}/config.json`))
                    continue;
                const instance = await Instance.build(file, this);
                instance.init();
                await instance.getConfig();

                instance.mods = await instance.getMods().catch(console.error);

                const loaderType = Util.getLoaderType(instance.config.loader.type);
                if(!instance.mods && loaderType?.includes('modded'))
                    instance.corrupt = true, instance.state = "Unavailable";
                instance.on('changed', _ => this.emit('changed'));
                instances.unshift(instance);
            }

        this.gettingInstances = false;
        this.setState();
        return instances;
    }

    setState(state) {
        this.state = state;
        this.emit('changed');
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
            case 'versions':
                return `${base}versions`;
            case 'temp':
                return `${base}temp`;
            default:
                return null;
        };
    }
};

export default await Instances.build();