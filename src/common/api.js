import pMap from 'p-map-browser';
import { create } from 'xmlbuilder2';
import { open } from '@tauri-apps/api/shell';
import { Body, fetch } from '@tauri-apps/api/http';
import { getCurrent } from '@tauri-apps/api/window';

import {
    AZURE_CLIENT_ID,
    AZURE_LOGIN_SCOPE,

    FORGE_VERSION_MANIFEST,
    MINECRAFT_VERSION_MANIFEST,

    MICROSOFT_LOGIN_URL,

    FTB_API_BASE,
    ESSENTIAL_BASE,
    MODRINTH_API_BASE,
    CURSEFORGE_API_BASE,

    QUILT_API_BASE,
    FABRIC_API_BASE
} from './constants';
import Util from './util';
import { Instance } from './instances';
import MicrosoftStore from './msStore';
import { MDPKM_API, ESSENTIAL_SITE, XSTS_AUTH_BASE, XBOX_AUTH_BASE, MINECRAFT_NEWS_RSS, MINECRAFT_SERVICES_API } from './constants';

export default class API {
    static async makeRequest(url, options = {}) {
        console.log(options.method ?? "GET", url, options);
        const response = await fetch(url, {
            body: options.body ?? Body.text(''),
            query: options.query ?? {},
            method: options.method ?? 'get',
            headers: options.headers ?? {},
            responseType: {JSON: 1, Text: 2, Binary: 3}[options.responseType] ?? 2
        });
        if(response.headers['content-type'].includes('application/json'))
            response.data = JSON.parse(response.data);
        console.log(url, options, response);
        return response.data;
    }

    static Modrinth = class ModrinthAPI {
        static projectCache = [];
        static SOURCE_NUMBER = 0;
        
        static Mods = class Mods {
            static search(query, options = {}) {
                return API.Modrinth.search(query, {
                    projectType: 'mod',
                    ...options
                }).then(data => {
                    data.hits = data.hits.map(mod => {
                        mod.source = 'Modrinth';
                        return mod;
                    });
                    return data;
                });
            }
        }

        static search(query, options = {}) {
            const { facets = [], versions = [], categories = [], projectType } = options;
            return API.makeRequest(`${MODRINTH_API_BASE}/search`, {
                query: {
                    query,
                    facets: JSON.stringify([
                        ...facets,
                        ...versions.map(ver => [`versions:${ver}`]),
                        ...categories.map(cat => [`categories:${cat}`]),
                        ...[projectType && [`project_type:${projectType}`]]
                    ])
                }
            });
        }

        static async getProject(id) {
            return this.projectCache[id] ??
                API.makeRequest(`${MODRINTH_API_BASE}/project/${id}`).then(project => {
                    this.projectCache[id] = project;
                    return project;
                });
        }

        static getProjectVersion(id) {
            return API.makeRequest(`${MODRINTH_API_BASE}/version/${id}`);
        }

        static getProjectVersions(id) {
            return API.makeRequest(`${MODRINTH_API_BASE}/project/${id}/version`);
        }

        static getCompatibleVersion({ loader }, versions) {
            return versions.find(({ loaders, game_versions }) =>
                loaders.some(l => l === loader.type) && game_versions.some(v => v === loader.game)
            );
        }
    }

    static CurseForge = class CurseForgeAPI {
        static SOURCE_NUMBER = 1;

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

            static getCompatibleVersion({ config }, versions) {
                return versions.find(({ loaders, game_versions }) =>
                    loaders.some(l => l === config.loader.type) && game_versions.some(v => v === config.loader.game)
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

                config.modifications = manifest.files.map(mod => [0, mod.projectID, mod.fileID, mod.slug]);
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

        static getProject(id) {
            return API.makeRequest(`${CURSEFORGE_API_BASE}/addons/${id}`);
        }
    }

    static FeedTheBeast = class FTBApi {
        static SOURCE_NUMBER = 2;

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
                                return Util.downloadFile(url, `${instance.path}/${path}`, true, name) // eslint-disable-next-line
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

    static Internal = class InternalAPI {
        static SOURCE_NUMBER = 3;
        static INTERNAL_VERSIONS = [{
            id: '189forge',
            files: [{ url: `${ESSENTIAL_BASE}/60ecf53d6b26c76a26d49e5b/6128d13e6b88c104dede042a/Essential-Forge-1.8.9.jar`, filename: 'essential-forge-1.8.9.jar' }],
            loaders: ['forge'],
            version: '1.8.9'
        }, {
            id: '1122forge',
            files: [{ url: `${ESSENTIAL_BASE}/60ecf53d6b26c76a26d49e5b/6128d13e6b88c104dede042a/Essential-Forge-1.12.2.jar`, filename: 'essential-forge-1.12.2.jar' }],
            loaders: ['forge'],
            version: '1.12.2'
        }, {
            id: '1171forge',
            files: [{ url: `${ESSENTIAL_BASE}/60ecf53d6b26c76a26d49e5b/61ead5dcbe87487a21aeaded/Essential-forge_1-17-1.jar`, filename: 'essential-forge-1.17.1.jar' }],
            loaders: ['forge'],
            version: '1.17.1'
        }, {
            id: '1171fabric',
            files: [{ url: `${ESSENTIAL_BASE}/60ecf53d6b26c76a26d49e5b/6128d13e6b88c104dede042a/Essential-Fabric-1.17.1.jar`, filename: 'essential-fabric-1.17.1.jar' }],
            loaders: ['fabric', 'quilt'],
            version: '1.17.1'
        }, {
            id: '1181fabric',
            files: [{ url: `${ESSENTIAL_BASE}/60ecf53d6b26c76a26d49e5b/61b4e1475b559418a4988419/Essential-fabric_1-18-1.jar`, filename: 'essential-fabric-1.18.1.jar' }],
            loaders: ['fabric', 'quilt'],
            version: '1.18.1'
        }, {
            id: '1182fabric',
            files: [{ url: `${ESSENTIAL_BASE}/60ecf53d6b26c76a26d49e5b/62307167d8793b3874ecb4ad/Essential-fabric_1-18-2.jar`, filename: 'essential-fabric-1.18.2.jar' }],
            loaders: ['fabric', 'quilt'],
            version: '1.18.2'
        }];
        static INTERNAL_PROJECTS = [{
            id: 'essential-container',
            slug: 'essential-container',
            title: 'Essential',
            author: 'Spark Universe',
            source: 'Internal',
            loaders: ['fabric', 'forge', 'quilt'],
            icon_url: 'essential-bg.svg',
            website_url: ESSENTIAL_SITE,
            client_side: 'required',
            server_side: 'unsupported',
            description: 'The essential multiplayer mod for Minecraft Java.'
        }];

        static Mods = class Mods {
            static async search(query) {
                return {
                    hits: API.Internal.INTERNAL_PROJECTS.filter(p =>
                        !query ||
                        p.title.toLowerCase().includes(query.toLowerCase()) ||
                        p.description.toLowerCase().includes(query.toLowerCase())
                    )
                };
            }
        }

        static async getProject(id) {
            return this.INTERNAL_PROJECTS.find(p => p.id === id);
        }

        static async getProjectVersion(id) {
            return this.INTERNAL_VERSIONS.find(v => v.id === id);
        }

        static async getProjectVersions() {
            return this.INTERNAL_VERSIONS;
        }

        static getCompatibleVersion({ loader }, versions) {
            return versions.find(v => v.loaders.some(l => l === loader.type) && v.version === loader.game);
        }
    }

    static GitHub = class GitHubAPI {
        static SOURCE_NUMBER = 4;

        static Mods = class Mods {
            static async search(query) {
                return {
                    hits: []
                };
            }
        }

        static async getProject(id) {
            return null;
        }

        static async getProjectVersion(id) {
            return null;
        }

        static async getProjectVersions() {
            return [];
        }

        static getCompatibleVersion({ config }, versions) {
            return null;
        }
    }

    static Microsoft = class MicrosoftAPI {
        static async getAccessData(code) {
            const { scope, expires_in, token_type, access_token, refresh_token } = await API.makeRequest(`${MDPKM_API}/v1/oauth/token`, {
                method: "POST",
                body: Body.json({
                    code
                })
            });

            console.warn("[API:Microsoft]: Signed into Microsoft successfully");
            return {
                scope,
                token: access_token,
                tokenType: token_type,
                expireDate: Date.now() + expires_in * 1000,
                refreshToken: refresh_token
            };
        }

        static async refreshAccessToken(refreshToken) {
            const { scope, expires_in, token_type, access_token, refresh_token } = await API.makeRequest(`${MDPKM_API}/v1/oauth/token`, {
                method: "POST",
                body: Body.json({
                    refreshToken
                })
            });

            console.warn("[API:Microsoft]: Refreshed Access Token");
            return {
                scope,
                token: access_token,
                tokenType: token_type,
                expireDate: Date.now() + expires_in * 1000,
                refreshToken: refresh_token
            };
        }

        static async verifyAccount(account) {
            account = {...account};
            const dateNow = Date.now();
            const { expireDate } = account.microsoft;
            if(dateNow >= expireDate) {
                console.warn(`[API:Microsoft]: Token expired, refreshing...`);
                account.microsoft = await this.getAccessData(account.xbox.token);
                return [account, true];
            }
            return [account, false];
        }

        static async getAccessCode(select) {
            const url = new URL(MICROSOFT_LOGIN_URL);
            url.searchParams.set('client_id', AZURE_CLIENT_ID);
            url.searchParams.set('response_type', 'code');
            url.searchParams.set('redirect_uri', 'http://localhost:3432');
            url.searchParams.set('cobrandid', '8058f65d-ce06-4c30-9559-473c9275a65d');
            url.searchParams.set('scope', AZURE_LOGIN_SCOPE);

            if(select)
                url.searchParams.set('prompt', 'select_account');

            open(url.href);

            const window = getCurrent();
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
        static async getAccessData(accessToken) {
            if(!accessToken)
                throw new Error(`Invalid Access Token: ${accessToken}`);
            const xboxData = await API.makeRequest(`${XBOX_AUTH_BASE}/user/authenticate`, {
                method: "POST",
                body: Body.json({
                    Properties: {
                        AuthMethod: "RPS",
                        SiteName: "user.auth.xboxlive.com",
                        RpsTicket: `d=${accessToken}`
                    },
                    RelyingParty: "http://auth.xboxlive.com",
                    TokenType: "JWT"
                })
            });

            console.warn("[API:XboxLive]: Signed into Xbox Live successfully");
            return {
                token: xboxData.Token,
                userHash: xboxData.DisplayClaims.xui[0].uhs,
                expireDate: new Date(xboxData.NotAfter).getTime()
            };
        }

        static async verifyAccount(account) {
            account = {...account};
            const dateNow = Date.now();
            const { expireDate } = account.xsts;
            if(dateNow >= expireDate) {
                console.warn(`[API:XboxLive]: XSTS Token expired, refreshing...`);
                if(dateNow >= account.xbox.expireDate) {
                    console.warn(`[API:XboxLive]: Token expired, refreshing...`);
                    [account] = await API.Microsoft.verifyAccount(account);
                    account.xbox = await this.getAccessData(account.microsoft.token);
                }
                console.log(account);
                account.xsts = await this.getXSTSData(account.xbox.token);
                return [account, true];
            }
            return [account, false];
        }

        static async getXSTSData(token) {
            if(!token)
                throw new Error(`Invalid Access Token: ${token}`);
            const xstsData = await API.makeRequest(`${XSTS_AUTH_BASE}/xsts/authorize`, {
                method: "POST",
                body: Body.json({
                    Properties: {
                        SandboxId: "RETAIL",
                        UserTokens: [ token ]
                    },
                    RelyingParty: "rp://api.minecraftservices.com/",
                    TokenType: "JWT"
                })
            });
            if(xstsData.XErr) {
                if(xstsData.Redirect)
                    open(xstsData.Redirect);
                switch(xstsData.XErr) {
                    case 2148916233:
                        throw new Error('Xbox Account required, login on minecraft.net to create one.');
                    case 2148916235:
                        throw new Error('Xbox Live is unavailable in your region.');
                    case 2148916236:
                    case 2148916237:
                        throw new Error('Adult verification required.');
                    case 2148916238:
                        throw new Error('Add Child to Family (This is a bug, please report!)');
                }
            }

            console.warn("[API:XboxLive]: Acquired XSTS Token");
            return {
                token: xstsData.Token,
                userHash: xstsData.DisplayClaims.xui[0].uhs,
                expireDate: new Date(xstsData.NotAfter).getTime()
            };
        }
    }

    static Minecraft = class MinecraftAPI {
        static accessData;

        static async getNews() {
            const data = await API.makeRequest(MINECRAFT_NEWS_RSS, {
                responseType: 'Text'
            });
            const xml = create(data).toObject();
            console.log(xml);

            return {
                news: xml.rss.channel.item,
                version: xml.rss['@version'],
                description: xml.rss.channel.description
            };
        }

        static async verifyAccount(account) {
            account = {...account};
            const dateNow = Date.now();
            const { expireDate } = account.minecraft;
            if(dateNow >= expireDate) {
                console.warn(`[API:Minecraft]: Token expired, refreshing...`);
                if(dateNow >= account.xsts.expireDate)
                    [account] = await API.XboxLive.verifyAccount(account);
                account.minecraft = await this.getAccessData(account.xsts);
                return [account, true];
            }
            return [account, false];
        }

        static async getProfile({ token, tokenType }) {
            if(!token) throw new Error(`Invalid Access Token: ${token}`);
            if(!tokenType) throw new Error(`Invalid Token Type: ${tokenType}`);
            const { id, name } = await API.makeRequest(`${MINECRAFT_SERVICES_API}/minecraft/profile`, {
                headers: {
                    Authorization: `${tokenType} ${token}`
                }
            });
            return { id, name };
        }

        static async getAccessData({ token, userHash }) {
            if(!token) throw new Error(`Invalid Access Token: ${token}`);
            if(!userHash) throw new Error(`Invalid User Hash: ${userHash}`);
            const { expires_in, token_type, access_token } = await API.makeRequest(`${MINECRAFT_SERVICES_API}/authentication/login_with_xbox`, {
                method: "POST",
                body: Body.json({
                    identityToken: `XBL3.0 x=${userHash};${token}`
                })
            });

            console.warn("[API:Minecraft]: Acquired Access Token");
            return {
                token: access_token,
                tokenType: token_type,
                expireDate: new Date().getTime() + expires_in * 1000
            };
        }

        static async ownsMinecraft({ token, tokenType }) {
            if(!token) throw new Error(`Invalid Access Token: ${token}`);
            if(!tokenType) throw new Error(`Invalid Token Type: ${tokenType}`);
            const { items } = await API.makeRequest(`${MINECRAFT_SERVICES_API}/entitlements/mcstore`, {
                headers: {
                    Authorization: `${tokenType} ${token}`
                }
            });
            if(!items.some(i => i.name === 'product_minecraft') || !items.some(i => i.name === 'game_minecraft'))
                return false;
            return items.length > 0;
        }

        static async getManifest() {
            return API.makeRequest(MINECRAFT_VERSION_MANIFEST);
        }
        
        static Bedrock = class BedrockAPI {
            static async getDownloadLink(version) {
                const versions = await MicrosoftStore.getVersions();
                const uuid = versions.find(v => v[0] === version)?.[1];
                if(!uuid)
                    throw new Error(`Couldn't find ${version}`);
                
                return MicrosoftStore.getDownloadLink(uuid, 1);
            }

            static async getLoaderVersions() {
                const versions = await MicrosoftStore.getVersions();
                versions.reverse();
                return [{
                    name: "Releases",
                    data: versions.filter(v => v[2] === 0).map(v => ({ name: v[0], value: v[0] }))
                }, {
                    name: "Previews",
                    data: versions.filter(v => v[2] === 2).map(v => ({ name: v[0], value: v[0] }))
                }];
            }

            static async something() {
                const configLastChanged = await MicrosoftStore.fetchConfigLastChanged();
                console.log(configLastChanged);
                const cookie = await MicrosoftStore.fetchCookie(configLastChanged);
                console.log(cookie);
                const versions = await MicrosoftStore.checkForVersions(cookie, []);
                const versions64 = versions.filter(v => v.packageMoniker.includes('x64'));
                console.log(versions, versions64);

                const { serverId, updateId, packageMoniker } = versions64[0];
                console.log(serverId, updateId, packageMoniker);
                const link = await MicrosoftStore.getDownloadLink(updateId, 1);
                console.log(link);
            }
        }
    }

    static Forge = class ForgeAPI {
        static async getManifest() {
            return API.makeRequest(FORGE_VERSION_MANIFEST);
        }
    }

    static Quilt = class QuiltAPI {
        static async getVersionManifest(game, version) {
            return API.makeRequest(`${QUILT_API_BASE}/versions/loader/${encodeURIComponent(game)}/${encodeURIComponent(version)}/profile/json`);
        }
    }

    static Fabric = class FabricAPI {
        static async getVersionManifest(game, version) {
            return API.makeRequest(`${FABRIC_API_BASE}/versions/loader/${encodeURIComponent(game)}/${encodeURIComponent(version)}/profile/json`);
        }
    }
}