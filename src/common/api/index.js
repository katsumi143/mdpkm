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
    static add(name, module) {
        this[name] = module;
        this[name].API = this;
    }
    static async makeRequest(url, options = {}) {
        console.log(options.method ?? "GET", url, options);
        const response = await fetch(url, {
            body: options.body ?? Body.text(''),
            query: options.query ?? {},
            method: options.method ?? 'get',
            headers: options.headers ?? {},
            responseType: {JSON: 1, Text: 2, Binary: 3}[options.responseType] ?? 2
        });
        if(response.headers['content-type']?.includes('application/json') || options.forceJson)
            response.data = JSON.parse(response.data);
        console.log(url, options, response);
        return response.data;
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
            static async get(id) {
                return new Mod(API.Internal.INTERNAL_PROJECTS.find(p => p.id === id));
            }

            static async search(query) {
                return {
                    hits: API.Internal.INTERNAL_PROJECTS.filter(p =>
                        !query ||
                        p.title.toLowerCase().includes(query.toLowerCase()) ||
                        p.description.toLowerCase().includes(query.toLowerCase())
                    ).map(m => new Mod(m))
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
        }
    }
};

import { Quilt, Forge, Fabric, GitHub, Modrinth, CurseForge, FeedTheBeast } from './custom';
API.add('Quilt', Quilt);
API.add('Forge', Forge);
API.add('Fabric', Fabric);
API.add('GitHub', GitHub);
API.add('Modrinth', Modrinth);
API.add('CurseForge', CurseForge);
API.add('FeedTheBeast', FeedTheBeast);

export default API;