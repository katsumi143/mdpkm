import pMap from 'p-map-browser';
import * as tauri from '@tauri-apps/api';

import semverValid from 'semver/functions/valid';

import {
    AZURE_CLIENT_ID,
    AZURE_LOGIN_SCOPE,

    FORGE_VERSION_MANIFEST,
    MINECRAFT_VERSION_MANIFEST,

    MICROSOFT_LOGIN_URL,

    CURSEFORGE_API_BASE,
    FTB_API_BASE,

    FABRIC_API_BASE
} from './constants';
import Util from './util';
import { Instance } from './instances';

export default class API {
    static async makeRequest(url, options = {}) {
        console.log(options.method ?? "GET", url, options);
        if(options.query) {
            const keys = Object.keys(options.query);
            for (let i = 0; i < keys.length; i++) {
                const value = options.query[keys[i]];
                if (value !== undefined)
                    options.query[keys[i]] = value.toString();
            }
        }
        const response = await tauri.invoke("web_request", {
            url,
            body: options.body ?? tauri.http.Body.json({}),
            method: options.method ?? "GET",
            query: options.query ?? {},
            headers: options.headers ?? {},
            responseType: {JSON: 1, Text: 2, Binary: 3}[options.responseType] ?? 1
        });
        console.log(url, options, response);
        return response.data;
    }

    static CurseForge = class CurseForgeAPI {
        static Modpacks = class Modpacks {
            static get(options = {}) {
                return API.makeRequest(`${CURSEFORGE_API_BASE}/addon/search`, {
                    query: {
                        gameId: 432,
                        sectionId: 4471,
                        categoryId: options.category ? options.category === -1 ? 0 : options.category : 0,
                        gameVersion: options.version === -1 ? undefined : options.version,
                        searchFilter: options.query
                    }
                }).then(modpacks => modpacks.map(modpack => new API.CurseForge.Modpack(modpack)));
            }

            static getCategories() {
                return API.makeRequest(`${CURSEFORGE_API_BASE}/category/section/4471`).then(categories =>
                    categories.map(({ id, name, avatarUrl }) => ({
                        id,
                        name,
                        icon: avatarUrl
                    }))
                );
            }
    
            static getVersions() {
                return API.makeRequest(`${CURSEFORGE_API_BASE}/minecraft/version`).then(versions =>
                    versions.map(({ id, versionString }) => ({
                        id: versionString,
                        name: versionString,
                        icon: null
                    }))
                );
            }
        };

        static Modpack = class Modpack {
            constructor(data) {
                this.data = data;

                const {
                    id,
                    name,
                    summary,
                    attachments,
                    authors,
                    downloadCount,
                    dateCreated,
                    dateModified,
                    latestFiles
                } = data;
                this.id = id;
                this.name = name;
                this.summary = summary;
                this.displayIcon = attachments.find(a => a.isDefault)?.thumbnailUrl;

                this.authors = authors;
                this.downloads = downloadCount;

                this.dateCreated = dateCreated;
                this.dateUpdated = dateModified;

                this.latestVersion = latestFiles.reverse()[0];
                this.latestGameVersion = this.latestVersion.gameVersion.find(v => /^\d/.test(v));
            }

            async getHTMLDescription() {
                if(this.htmlDescription)
                    return this.htmlDescription;

                this.htmlDescription = await API.makeRequest(`${CURSEFORGE_API_BASE}/addon/${this.data.id}/description`, {
                    responseType: "Text"
                });
                return this.htmlDescription;
            }

            async createInstance(instances, path, manifest) {
                const instance = await Instance.build({
                    name: this.name,
                    path
                }, instances);
                instance.on('changed', _ => instances.emit('changed'));

                const config = await instance.getConfig();
                config.loader.type = manifest.minecraft.modLoaders.find(l => l.primary).id.split("-")[0];
                config.loader.game = manifest.minecraft.version;
                config.loader.version = manifest.minecraft.modLoaders.find(l => l.primary).id.split("-")[1];

                config.modpack.source = "curseforge";
                config.modpack.project = this.id;
                config.modpack.cachedName = this.name;

                config.modifications = manifest.files.map(mod => [0, mod.projectID, mod.fileID]);
                await instance.saveConfig(config);

                instances.instances.unshift(instance);
                return instance;
            }

            async install(instances, update) {
                const latestFile = this.latestVersion;

                update("Downloading Pack Archive");
                const zipFile = await Util.downloadFile(
                    encodeURI(latestFile.downloadUrl),
                    instances.getPath("temp"),
                    true
                );
                update("Extracting Archive Contents");

                const instanceDir = `${instances.dataPath}/${this.name}`;
                if(!await Util.fileExists(instanceDir))
                    await Util.createDir(instanceDir);

                await Util.extractZip(zipFile, instanceDir);

                update("Moving Overrides");
                const overrides = await Util.readDir(`${instanceDir}/overrides`);
                for (const override of overrides) {
                    await Util.moveFolder(override.path, `${instanceDir}/${override.name}`);
                }
                
                update("Removing Unneeded Files");
                await Util.removeDir(`${instanceDir}/overrides`);
                await Util.removeFile(`${instanceDir}/modlist.html`);

                update("Downloading Icon");
                await Util.downloadFile(
                    this.displayIcon,
                    instanceDir,
                    undefined,
                    'icon.png'
                );

                update("Saving Data");
                await Util.writeFile(`${instanceDir}/modpack.json`, JSON.stringify(this.data));

                const instance = await this.createInstance(
                    instances,
                    instanceDir,
                    JSON.parse(await Util.readTextFile(`${instanceDir}/manifest.json`))
                );
                instance.modpack = this;
                instance.state = "Waiting...";
                instances.emit("changed");

                await Util.removeFile(`${instanceDir}/manifest.json`);

                await instance.getConfig();
                await instance.installMods(update);
                instance.mods = await instance.getMods();

                await instances.installLoader(instance, update);
                instance.corrupt = false;
                instance.setState(null);
            }

            async installMods(instance, update, concurrency = 20) {
                const config = await instance.getConfig();
                const modsDir = `${instance.path}/mods`;

                instance.setState("Installing Mods");
                update?.("Installing Mods");

                let downloaded = 0;
                return pMap(
                    config.modifications,
                    async modification => {
                        let ok = false;
                        let tries = 0;
                        do {
                            tries += 1;
                            if (tries !== 1)
                                await new Promise(resolve => setTimeout(resolve, 5000));
                            try {
                                const modId = modification[1], fileId = modification[2];
                                const file = await API.makeRequest(`${CURSEFORGE_API_BASE}/addon/${modId}/file/${fileId}`);
                                return Util.downloadFile(encodeURI(file.downloadUrl), modsDir, true) // eslint-disable-next-line
                                    .then(_ => {
                                        const text = `Installing Mods (${downloaded += 1}/${config.modifications.length})`;
                                        instance.setState(text);
                                        update?.(text);
                                    })
                            } catch (err) {
                                console.error(err);
                            }
                        } while (!ok && tries <= 3);
                    },
                    { concurrency }
                );
            }
        }
    }

    static FeedTheBeast = class FTBApi {
        static Modpacks = class Modpacks {
            static modpacks;

            static async get(options = {}) {
                const tag = (m, v) => m.tags?.some(t => t.name === v);
                const filter = modpack =>
                    (!options.query || modpack.name.toLowerCase().includes(options.query.toLowerCase())) &&
                    (options.category === 0 || tag(modpack, options.category)) &&
                    (options.version === -1 || tag(modpack, options.version));
                const sort = (a, b) =>
                    a.featured && b.featured ? 0 :
                    a.featured ? 1 : -1
                if(this.modpacks)
                    return this.modpacks.filter(filter).sort(sort);
                return API.makeRequest(`${FTB_API_BASE}/public/modpack/popular/installs/FTB/all`).then(async ({ packs: modpacks }) => {
                    this.modpacks = [];
                    await pMap(
                        modpacks,
                        async id => {
                            let ok = false;
                            let tries = 0;
                            do {
                                tries += 1;
                                if (tries !== 1)
                                    await new Promise(resolve => setTimeout(resolve, 5000));
                                try {
                                    const modpack = await API.makeRequest(`${FTB_API_BASE}/public/modpack/${id}`);
                                    if(modpack.status !== "error")
                                        return this.modpacks.unshift(new API.FeedTheBeast.Modpack(
                                            modpack
                                        ));
                                } catch (err) {
                                    console.error(err);
                                }
                            } while (!ok && tries <= 3);
                        },
                        { concurrency: 60 }
                    );
                    return this.modpacks.filter(filter).sort(sort);
                });
            }

            static getCategories() {
                return API.makeRequest(`${FTB_API_BASE}/public/tag/popular/50`).then(({ tags }) =>
                    tags.filter(t => /^[A-Za-z]\w*$/.test(t)).map(tag => ({
                        id: tag,
                        name: tag,
                        icon: null
                    }))
                );
            }
    
            static getVersions() {
                return API.makeRequest(`${FTB_API_BASE}/public/tag/popular/50`).then(({ tags }) =>
                    tags.filter(t => /[0-9]/.test(t)).map(tag => ({
                        id: tag,
                        name: tag,
                        icon: null
                    }))
                );
            }
        };

        static Modpack = class Modpack {
            static hasHTMLSummary = true;

            constructor(data) {
                this.data = data;

                const {
                    id,
                    name,
                    synopsis,
                    art,
                    authors,
                    installs,
                    //dateCreated,
                    updated,
                    versions
                } = data;
                this.id = id;
                this.name = name;
                this.summary = synopsis;
                this.displayIcon = art.filter(a => a.type === "square").reverse()[0].url;

                this.authors = authors;
                this.downloads = installs;

                this.dateCreated = 0;//dateCreated;
                this.dateUpdated = updated * 1000;

                this.latestVersion = versions.reverse()[0];
                this.latestGameVersion = this.latestVersion.targets.find(v => v.type === "game")?.version ??
                    versions.find(v => v.targets.find(t =>
                        t.type === "modloader" &&
                        t.version === this.latestVersion.targets.find(y => y.type === "modloader")?.version
                    )).targets.find(v => v.type === "game")?.version ??
                    versions.find(v => v.targets.find(t => t.type === "game")).targets.find(v => v.type === "game")?.version
            }

            getLatestVersion() {
                return API.makeRequest(`${FTB_API_BASE}/public/modpack/${this.id}/${this.latestVersion.id}`);
            }

            async createInstance(instances, path, manifest) {
                const instance = await Instance.build({
                    name: this.name,
                    path
                }, instances);
                instance.on('changed', _ => instances.emit('changed'));

                const loader = manifest.targets.find(t => t.type === "modloader");

                const config = await instance.getConfig();
                config.loader.type = loader.name;
                config.loader.game = manifest.targets.find(t => t.type === "game")?.version ?? this.latestGameVersion;
                config.loader.version = loader.version;

                config.modpack.source = "feedthebeast";
                config.modpack.project = this.id;
                config.modpack.cachedName = this.name;

                config.files = manifest.files.map(file => [1, file.name, file.url, file.path]);
                await instance.saveConfig(config);

                instances.instances.unshift(instance);
                return instance;
            }

            async install(instances, update) {
                update("Fetching Version Manifest");
                const latestVersion = await this.getLatestVersion();
                const instanceDir = `${instances.dataPath}/${this.name}`;
                if(!await Util.fileExists(instanceDir))
                    await Util.createDir(instanceDir);

                const instance = await this.createInstance(
                    instances,
                    instanceDir,
                    latestVersion
                );
                instance.modpack = this;
                instance.state = "Waiting...";
                instances.emit("changed");

                update("Downloading Files");
                await this.downloadFiles(instance, update);

                update("Downloading Icon");
                await Util.downloadFile(
                    this.displayIcon,
                    instanceDir,
                    undefined,
                    'icon.png'
                );

                update("Saving Data");
                await Util.writeFile(`${instanceDir}/modpack.json`, JSON.stringify(this.data));

                await instance.getConfig();
                instance.mods = await instance.getMods();

                await instances.installLoader(instance, update);
                instance.corrupt = false;
                instance.setState(null);
            }

            async downloadFiles(instance, update, concurrency = 20) {
                const config = await instance.getConfig();

                instance.setState("Downloading Files");
                update?.("Downloading Files");

                let downloaded = 0;
                return pMap(
                    config.files,
                    async file => {
                        let ok = false;
                        let tries = 0;
                        do {
                            tries += 1;
                            if (tries !== 1)
                                await new Promise(resolve => setTimeout(resolve, 5000));
                            try {
                                const name = file[1], url = file[2], path = file[3];
                                return Util.downloadFile(encodeURI(url), `${instance.path}/${path}`, true, name) // eslint-disable-next-line
                                    .then(_ => {
                                        const text = `Downloading Files (${downloaded += 1}/${config.files.length})`;
                                        instance.setState(text);
                                        update?.(text);
                                    })
                            } catch (err) {
                                console.error(err);
                            }
                        } while (!ok && tries <= 3);
                    },
                    { concurrency }
                );
            }
        };
    }

    static Microsoft = class MicrosoftAPI {
        static accessData;

        static async getAccessToken() {
            if(this.accessData instanceof Object)
                return this.accessData.access_token;
            const code = await this.getAccessCode();
            const tokenData = await API.makeRequest("https://mdpkm.voxelified.com/api/v1/oauth/token", {
                method: "POST",
                body: tauri.http.Body.json({
                    code
                })
            });
            this.accessData = tokenData;

            console.warn("[API:Microsoft]: Signed into Microsoft successfully");
            return this.accessData.access_token;
        }

        static async refreshAccessToken() {

        }

        static async getAccessCode() {
            const url = new URL(MICROSOFT_LOGIN_URL);
            url.searchParams.set('client_id', AZURE_CLIENT_ID);
            url.searchParams.set('response_type', 'code');
            url.searchParams.set('redirect_uri', 'http://localhost:3432');
            url.searchParams.set('scope', AZURE_LOGIN_SCOPE);

            tauri.shell.open(url.href);

            const window = tauri.window.getCurrent();
            window.emit('msAuth');
            
            return new Promise((resolve, reject) => {
                window.listen('msCode', ({ payload }) => {
                    if(!payload.startsWith('/?code='))
                        return;
                    const code = payload.replace('/?code=', '');

                    resolve(code);
                });
            });
        }
    }

    static XboxLive = class XboxLiveAPI {
        static xboxData;
        static xstsData;

        static async getToken() {
            if(this.xboxData instanceof Object)
                return this.xboxData.token;
            const accessToken = await API.Microsoft.getAccessToken();
            const xboxData = await API.makeRequest("https://user.auth.xboxlive.com/user/authenticate", {
                method: "POST",
                body: tauri.http.Body.json({
                    Properties: {
                        AuthMethod: "RPS",
                        SiteName: "user.auth.xboxlive.com",
                        RpsTicket: `d=${accessToken}`
                    },
                    RelyingParty: "http://auth.xboxlive.com",
                    TokenType: "JWT"
                })
            });
            this.xboxData = {
                token: xboxData.Token,
                expires: xboxData.NotAfter,
                user_hash: xboxData.DisplayClaims.xui[0].uhs
            };

            console.warn("[API:XboxLive]: Signed into Xbox Live successfully");
            return this.xboxData.token;
        }

        static async getXSTSToken() {
            if(this.xstsData instanceof Object)
                return this.xstsData.token;

            const token = await this.getToken();
            const xstsData = await API.makeRequest("https://xsts.auth.xboxlive.com/xsts/authorize", {
                method: "POST",
                body: tauri.http.Body.json({
                    Properties: {
                        SandboxId: "RETAIL",
                        UserTokens: [ token ]
                    },
                    RelyingParty: "rp://api.minecraftservices.com/",
                    TokenType: "JWT"
                })
            });
            this.xstsData = {
                token: xstsData.Token,
                expires: xstsData.NotAfter,
                user_hash: xstsData.DisplayClaims.xui[0].uhs
            };

            console.warn("[API:XboxLive]: Acquired XSTS Token");
            return this.xstsData.token;
        }
    }

    static Minecraft = class MinecraftAPI {
        static accessData;

        static async getAccount() {
            const accessToken = await this.getAccessToken();
            const profile = await API.makeRequest("https://api.minecraftservices.com/minecraft/profile", {
                headers: {
                    Authorization: `${this.accessData.token_type} ${accessToken}`
                }
            });
            return {
                profile,
                accessToken
            };
        }

        static async getAccessToken() {
            if(this.accessData instanceof Object)
                return this.accessData.access_token;

            const xstsToken = await API.XboxLive.getXSTSToken();
            const accessData = await API.makeRequest("https://api.minecraftservices.com/authentication/login_with_xbox", {
                method: "POST",
                body: tauri.http.Body.json({
                    identityToken: `XBL3.0 x=${API.XboxLive.xstsData.user_hash};${xstsToken}`
                })
            });
            this.accessData = accessData;

            console.warn("[API:Minecraft]: Acquired Access Token");
            return this.accessData.access_token;
        }

        static async getManifest() {
            return API.makeRequest(MINECRAFT_VERSION_MANIFEST);
        }
    }

    static Forge = class ForgeAPI {
        static async getManifest() {
            return API.makeRequest(FORGE_VERSION_MANIFEST);
        }
    }

    static Fabric = class FabricAPI {
        static async getVersionManifest(game, version) {
            return API.makeRequest(`${FABRIC_API_BASE}/versions/loader/${encodeURIComponent(game)}/${encodeURIComponent(version)}/profile/json`);
        }
    }
}