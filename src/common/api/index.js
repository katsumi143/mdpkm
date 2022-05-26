import { create } from 'xmlbuilder2';
import { open } from '@tauri-apps/api/shell';
import { Body, fetch } from '@tauri-apps/api/http';
import { getCurrent } from '@tauri-apps/api/window';

import {
    AZURE_CLIENT_ID,
    AZURE_LOGIN_SCOPE,

    MINECRAFT_VERSION_MANIFEST,

    MICROSOFT_LOGIN_URL,

    ESSENTIAL_BASE
} from '/src/common/constants';
import Mod from './structs/mod';
import Project from './structs/project';
import MicrosoftStore from '/src/common/msStore';
import { MDPKM_API, ESSENTIAL_SITE, XSTS_AUTH_BASE, XBOX_AUTH_BASE, MINECRAFT_NEWS_RSS, MINECRAFT_SERVICES_API } from '/src/common/constants';

class API {
    static mapped = {};
    static loaders = [];
    static instanceTypes = [{
        name: 'first_party',
        types: []
    }, {
        name: 'third_party_modpacks',
        types: [{
            id: 'modpack',
            isLoader: true
        }]
    }, {
        name: 'third_party',
        types: []
    }, {
        name: 'other',
        types: [{
            id: 'import',
            isImport: true
        }, {
            id: 'import2'
        }]
    }];

    static async add(name, module) {
        this[name] = module;
        this[name].API = this;
        this.mapped[module.id] = this[name];
        if (typeof this[name].init === 'function')
            await this[name].init();
    }

    static get(id) {
        return this.mapped[id];
    }

    static getModPlatforms() {
        return Object.values(this.mapped).filter(a => a.Mods);
    }

    static getModPlatformIDs() {
        return this.getModPlatforms().map(a => a.id);
    }

    static getModpackPlatforms() {
        return Object.values(this.mapped).filter(a => a.Modpacks);
    }

    static getModpackPlatformIDs() {
        return this.getModpackPlatforms().map(a => a.id);
    }

    static addLoader(id, icon, source, options = {}) {
        const { category, description, ...restOptions } = options;
        API.addInstanceType(category ?? 'third_party', {
            id,
            icon,
            isLoader: true,
            description
        });
        API.loaders.push({
            id,
            icon,
            source,
            ...restOptions
        });
    }

    static addInstanceType(categoryName, data) {
        const category = this.instanceTypes.find(c => c.name === categoryName);
        if(category)
            return category.types.push(data);
        return this.instanceTypes.push({
            name: categoryName,
            types: [data]
        });
    }

    static getLoader(id) {
        return this.loaders.find(l => l.id === id);
    }

    static async makeRequest(url, options = {}) {
        console.log(options.method ?? 'GET', url, options);
        const response = await fetch(url, {
            body: options.body ?? Body.text(''),
            query: options.query ?? {},
            method: options.method ?? 'get',
            headers: options.headers ?? {},
            responseType: {JSON: 1, Text: 2, Binary: 3}[options.responseType] ?? 2
        });
        if(!response.ok)
            throw new Error(`${response.status} ${response.data}`);
        if(response.headers['content-type']?.includes('application/json') || options.forceJson)
            response.data = JSON.parse(response.data);
        console.log(url, options, response);
        return response.data;
    }

    static Internal = class InternalAPI {
        static id = 'internal';
        static icon = 'img/icons/brand_default.svg';
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
            loaders: ['fabric', 'forge', 'quilt'],
            icon_url: 'img/icons/essential_mod.svg',
            website_url: ESSENTIAL_SITE,
            client_side: 'required',
            server_side: 'unsupported',
            description: 'The essential multiplayer mod for Minecraft Java.'
        }];

        static Mods = class Mods {
            static async get(id) {
                return new Mod(API.Internal.INTERNAL_PROJECTS.find(p => p.id === id), 'internal');
            }

            static async search(query) {
                return {
                    hits: API.Internal.INTERNAL_PROJECTS.filter(p =>
                        !query ||
                        p.title.toLowerCase().includes(query.toLowerCase()) ||
                        p.description.toLowerCase().includes(query.toLowerCase())
                    ).map(m => new Mod(m, 'internal'))
                };
            }
        }

        static async getProject(id) {
            return new Project(this.INTERNAL_PROJECTS.find(p => p.id === id));
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

    static Microsoft = class MicrosoftAPI {
        static async getAccessData(code) {
            const { scope, expires_in, token_type, access_token, refresh_token } = await API.makeRequest(`${MDPKM_API}/v1/oauth/token`, {
                method: 'POST',
                body: Body.json({
                    code
                })
            });

            console.warn('[API:Microsoft]: Signed into Microsoft successfully');
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
                method: 'POST',
                body: Body.json({
                    refreshToken
                })
            });

            console.warn('[API:Microsoft]: Refreshed Access Token');
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
                method: 'POST',
                body: Body.json({
                    Properties: {
                        AuthMethod: 'RPS',
                        SiteName: 'user.auth.xboxlive.com',
                        RpsTicket: `d=${accessToken}`
                    },
                    RelyingParty: 'http://auth.xboxlive.com',
                    TokenType: 'JWT'
                })
            });

            console.warn('[API:XboxLive]: Signed into Xbox Live successfully');
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
                account.xsts = await this.getXSTSData(account.xbox.token);
                return [account, true];
            }
            return [account, false];
        }

        static async getXSTSData(token) {
            if(!token)
                throw new Error(`Invalid Access Token: ${token}`);
            const xstsData = await API.makeRequest(`${XSTS_AUTH_BASE}/xsts/authorize`, {
                method: 'POST',
                body: Body.json({
                    Properties: {
                        SandboxId: 'RETAIL',
                        UserTokens: [ token ]
                    },
                    RelyingParty: 'rp://api.minecraftservices.com/',
                    TokenType: 'JWT'
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

            console.warn('[API:XboxLive]: Acquired XSTS Token');
            return {
                token: xstsData.Token,
                userHash: xstsData.DisplayClaims.xui[0].uhs,
                expireDate: new Date(xstsData.NotAfter).getTime()
            };
        }
    }

    static Minecraft = class MinecraftAPI {
        static type = 'java-vanilla';
        static accessData;

        static async getNews() {
            const data = await API.makeRequest(MINECRAFT_NEWS_RSS, {
                responseType: 'Text'
            });
            const xml = create(data).toObject();
            return {
                news: xml.rss.channel.item,
                version: xml.rss['@version'],
                description: xml.rss.channel.description
            };
        }

        static getVersions() {
            return API.makeRequest(MINECRAFT_VERSION_MANIFEST).then(versions =>
                [{
                    name: "Releases",
                    data: versions.versions.filter(v => v.type == "release").map(v => ({ name: v.id, value: v.id }))
                }, {
                    name: "Snapshots",
                    data: versions.versions.filter(v => v.type == "snapshot").map(v => ({ name: v.id, value: v.id }))
                }, {
                    name: "Old Betas",
                    data: versions.versions.filter(v => v.type == "old_beta").map(v => ({ name: v.id, value: v.id }))
                }, {
                    name: "Old Alphas",
                    data: versions.versions.filter(v => v.type == "old_alpha").map(v => ({ name: v.id, value: v.id }))
                }]
            );
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
                method: 'POST',
                body: Body.json({
                    identityToken: `XBL3.0 x=${userHash};${token}`
                })
            });

            console.warn('[API:Minecraft]: Acquired Access Token');
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
            static type = 'bedrock-vanilla';
            
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
                    name: 'Releases',
                    data: versions.filter(v => v[2] === 0).map(v => ({ name: v[0], value: v[0] }))
                }, {
                    name: 'Previews',
                    data: versions.filter(v => v[2] === 2).map(v => ({ name: v[0], value: v[0] }))
                }];
            }
        }
    }
};

import { Quilt, Forge, Fabric, GitHub, Modrinth, CurseForge, FeedTheBeast } from './custom';
await API.add('Quilt', Quilt);
await API.add('Forge', Forge);
await API.add('Fabric', Fabric);
await API.add('GitHub', GitHub);
await API.add('Modrinth', Modrinth);
await API.add('CurseForge', CurseForge);
await API.add('FeedTheBeast', FeedTheBeast);

API.addLoader('java', 'img/icons/minecraft/java.png', API.Minecraft, {
    banner: 'img/banners/minecraft_franchise.svg',
    category: 'first_party',
    creatorIcon: 'img/icons/mojang_studios.svg',
    versionBanners: [
        [/^22w13oneblockatatime/, 'img/banners/minecraft_franchise.svg', 'One Block at a Time (April Fools)'],
        [/^20w14infinite/, 'img/banners/minecraft_franchise.svg', 'The Ultimate Content Update (April Fools)'],
        [/^3D Shareware v1\.34/, 'img/banners/minecraft_franchise.svg', '3D Shareware v1.34 (April Fools)'],
        [/^\d\.RV-.*/, 'img/banners/minecraft_franchise.svg', 'Trendy Update (April Fools)'],
        [/^15w14a/, 'img/banners/minecraft_franchise.svg', 'The Loves and Hugs Update (April Fools)'],
        [/^\d+(w\d+[a-z]|.*?-(rc|pre)\d+)/, 'img/banners/minecraft_franchise.svg', 'Minecraft Snapshot'],
    
        [/^1\.19/, 'img/banners/versions/minecraft_1.19.webp', 'The Wild Update'],,
        [/^1\.18/, 'img/banners/versions/minecraft_1.17-1.18.webp', 'Caves & Cliffs: Part II'],
        [/^1\.17/, 'img/banners/versions/minecraft_1.17-1.18.webp', 'Caves & Cliffs: Part I'],
        [/^1\.16/, 'img/banners/versions/minecraft_1.16.webp', 'The Nether Update'],
        [/^1\.16/, 'img/banners/minecraft_franchise.svg', 'Buzzy Bees'],
        [/^1\.14/, 'img/banners/versions/minecraft_1.14.webp', 'Village & Pillager'],
        [/^1\.13/, 'img/banners/versions/minecraft_1.13.webp', 'Update Aquatic'],
        [/^1\.12/, 'img/banners/minecraft_franchise.svg', 'World of Color Update'],
        [/^1\.11/, 'img/banners/minecraft_franchise.svg', 'Exploration Update'],
        [/^1\.10/, 'img/banners/minecraft_franchise.svg', 'Frostburn Update'],
        [/^1\.9/, 'img/banners/minecraft_franchise.svg', 'Cpmbat Update'],
        [/^1\.8/, 'img/banners/minecraft_franchise.svg', 'Bountiful Update'],
        [/^1\.7/, 'img/banners/minecraft_franchise.svg', 'The Update that Changed the World'],
        [/^1\.6/, 'img/banners/minecraft_franchise.svg', 'Horse Update'],
        [/^1\.5/, 'img/banners/minecraft_franchise.svg', 'Redstone Update'],
        [/^1\.4/, 'img/banners/minecraft_franchise.svg', 'Pretty Scary Update'],
        [/^1\.3/, 'img/banners/minecraft_franchise.svg', 'Minecraft Full Release'],
        [/^1\.2/, 'img/banners/minecraft_franchise.svg', 'Minecraft Full Release'],
        [/^1\.1/, 'img/banners/minecraft_franchise.svg', 'Minecraft Full Release'],
        [/^1\.0/, 'img/banners/minecraft_franchise.svg', 'Adventure Update'],
    
        [/^b.+/, 'img/banners/minecraft_old.webp', 'Minecraft Beta'],
        [/^a.+/, 'img/banners/minecraft_old.webp', 'Minecraft Alpha']
    ]
});
API.addLoader('bedrock', 'img/icons/minecraft/bedrock.png', API.Minecraft.Bedrock, {
    banner: 'img/banners/minecraft_franchise.svg',
    category: 'first_party',
    creatorIcon: 'img/icons/mojang_studios.svg',
    versionBanners: [
        [/1\.19/, 'img/banners/versions/minecraft_1.19.webp', 'The Wild Update'],
        [/1\.18/, 'img/banners/versions/minecraft_1.17-1.18.webp', 'Caves & Cliffs: Part II'],
        [/1\.17/, 'img/banners/versions/minecraft_1.17-1.18.webp', 'Caves & Cliffs: Part I']
    ]
});

API.mapped.internal = API.Internal;

export default API;