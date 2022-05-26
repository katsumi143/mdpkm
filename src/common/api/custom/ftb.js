import { FTB_API_BASE } from '/src/common/constants';
export default class FTBApi {
    static id = 'ftb';
    static icon = 'img/icons/platforms/feedthebeast.png';

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
                                if(modpack.status !== 'error')
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
            this.displayIcon = art.filter(a => a.type === 'square').reverse()[0].url;

            this.authors = authors;
            this.downloads = installs;

            this.dateCreated = 0;//dateCreated;
            this.dateUpdated = updated * 1000;

            this.latestVersion = versions.reverse()[0];
            this.latestGameVersion = this.latestVersion.targets.find(v => v.type === 'game')?.version ??
                versions.find(v => v.targets.find(t =>
                    t.type === 'modloader' &&
                    t.version === this.latestVersion.targets.find(y => y.type === 'modloader')?.version
                )).targets.find(v => v.type === 'game')?.version ??
                versions.find(v => v.targets.find(t => t.type === 'game')).targets.find(v => v.type === 'game')?.version
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

            const loader = manifest.targets.find(t => t.type === 'modloader');

            const config = await instance.getConfig();
            config.loader.type = loader.name;
            config.loader.game = manifest.targets.find(t => t.type === 'game')?.version ?? this.latestGameVersion;
            config.loader.version = loader.version;

            config.modpack.source = 'feedthebeast';
            config.modpack.project = this.id;
            config.modpack.cachedName = this.name;

            config.files = manifest.files.map(file => [1, file.name, file.url, file.path]);
            await instance.saveConfig(config);

            instances.instances.unshift(instance);
            return instance;
        }

        async install(instances, update) {
            update('Fetching Version Manifest');
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
            instance.state = 'Waiting...';
            instances.emit('changed');

            update('Downloading Files');
            await this.downloadFiles(instance, update);

            update('Downloading Icon');
            await Util.downloadFile(
                this.displayIcon,
                instanceDir,
                undefined,
                'icon.png'
            );

            update('Saving Data');
            await Util.writeFile(`${instanceDir}/modpack.json`, JSON.stringify(this.data));

            await instance.getConfig();
            instance.mods = await instance.getMods();

            await instances.installLoader(instance, update);
            instance.corrupt = false;
            instance.setState(null);
        }

        async downloadFiles(instance, update, concurrency = 20) {
            const config = await instance.getConfig();

            instance.setState('Downloading Files');
            update?.('Downloading Files');

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
};