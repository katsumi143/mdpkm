import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { PlusLg, GearFill, ArrowLeft } from 'react-bootstrap-icons';

import App from '/src/components/App';
import News from '../components/News';
import Main from '/voxeliface/components/Main';
import Grid from '/voxeliface/components/Grid';
import Header from '/src/components/Header';
import Button from '/voxeliface/components/Button';
import Settings from '../components/Settings';
import LoaderSetup from '../components/LoaderSetup';
import InstanceList from '../components/InstanceList';
import InstancePage from '../components/InstancePage';

import SelectInstanceType from '../components/SelectInstanceType';

import API from '../common/api';
import Instances from '../common/instances';
import LocalStrings from '../localization/strings';
import { LoaderIcons, QUILT_API_BASE, FABRIC_API_BASE, FORGE_VERSION_MANIFEST, MINECRAFT_VERSION_MANIFEST } from '../common/constants';

export default function Home() {
    const [_, setBruh] = useState(0);
    const [page, setPage] = useState('home');
    const [loading, setLoading] = useState(false);
    const [instance, setInstance] = useState();
    const [instances, setInstances] = useState();
    const [settingUp, setSettingUp] = useState();
    const [sidebarActive, setSidebarActive] = useState(true);
    const [loaderVersions, setLoaderVersions] = useState();
    const setupBackToSelect = () => {
        setLoaderVersions();
        setSettingUp();
        setPage('add-instance');
    };
    const selectBackToHome = () => {
        setSidebarActive(true);
        setPage('home');
    };
    const addInstancePage = () => {
        setSidebarActive(false);
        setPage('add-instance');
    };
    const importInstance = () => {
        setPage('home');
        setLoading(false);
        setSidebarActive(true);
        Instances.importInstance();
    };
    const selectInstance = index => setInstance(index);
    const installLoader = async(name, loader, gameVersion, loaderVersion, setState) => {
        setState('Preparing...');
        await Instances.installInstanceWithLoader(name, loader, gameVersion, loaderVersion, setState).catch(err => {
            console.error(err);
            toast.error(`Instance Installation Failed!\n${err.message ?? 'Unknown Reason.'}`);
        });
        toast.success(`${name} was created successfully.`);
        setPage('home');
        setInstance(Instances.instances.findIndex(i => i.name === name));
        setSettingUp();
        setSidebarActive(true);
        setLoaderVersions();
    };
    const settingsPage = () => {
        setSidebarActive(false);
        setPage('settings');
    };
    const chooseLoader = async loader => {
        setLoading(true);
        if(loader === "bedrock") {
            const versions = await API.Minecraft.Bedrock.getLoaderVersions();
            console.log(versions);

            setLoaderVersions(versions);
        } else {
            const versions = await API.makeRequest({
                java: MINECRAFT_VERSION_MANIFEST,
                forge: FORGE_VERSION_MANIFEST,
                quilt: `${QUILT_API_BASE}/versions`,
                fabric: `${FABRIC_API_BASE}/versions`
            }[loader]).then(versions => {
                switch(loader) {
                    case "java":
                        return [{
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
                        }];
                    case "quilt":
                    case "fabric":
                        const fabric = {};
                        const loaders = versions.loader.map(y => y.version);
                        for (const { version } of versions.game) {
                            fabric[version] = loaders;
                        }
                        return fabric;
                    default:
                        return versions;
                }
            });
            setLoaderVersions(versions);
        }
        setSettingUp(loader);
        setLoading(false);
        setPage('setup-loader');
    };
    const newsPage = () => {
        setSidebarActive(false);
        setPage('news');
    };

    useEffect(() => {
        if(!Instances.instances && !Instances.gettingInstances)
            Instances.getInstances().then(i => {
                Instances.on('changed', () => {
                    setBruh(bruh => bruh + 1);
                    setInstances(Instances.instances);
                });
                setInstances(i);
            });
        else if(!instances)
            setInstances(Instances.instances);
    });

    return (
        <App>
            <Header icon="/text.png"/>
                <Main css={{
                    padding: 0,
                    overflow: 'hidden auto',
                    flexDirection: 'row'
                }}>
                    <Grid width="35%" height="100%" direction="vertical" background="$blackA2" justifyContent="space-between" css={{
                        opacity: sidebarActive ? 1 : 0,
                        maxWidth: '35%',
                        position: 'absolute',
                        maxHeight: 'inherit',
                        transform: sidebarActive ? 'none' : 'translateX(-100%)',
                        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: sidebarActive ? 'unset' : 'none'
                    }}>
                        <InstanceList selected={instance} onSelect={selectInstance} instances={instances}/>
                        <Grid width="100%" spacing="1rem" background="$secondaryBackground" alignItems="center" justifyContent="center" css={{
                            minHeight: 64
                        }}>
                            <Button onClick={addInstancePage}>
                                <PlusLg/>
                                {LocalStrings['app.mdpkm.home.sidebar.buttons.add_instance']}
                            </Button>
                            <Button theme="secondary" onClick={settingsPage}>
                                <GearFill/>
                                {LocalStrings['app.mdpkm.home.sidebar.buttons.settings']}
                            </Button>
                            <Button theme="secondary" onClick={newsPage}>
                                News
                            </Button>
                        </Grid>
                    </Grid>
                    {page === 'home' &&
                        instances?.[instance] && !Instances.gettingInstances &&
                        <InstancePage instance={instance}/>
                    }
                    {page === 'add-instance' ?
                        <SelectInstanceType loading={loading} settingUp={settingUp} types={[
                            "divide:Supported by Mojang Studios",
                            ["java_vanilla",
                                LoaderIcons.java,
                                [["Continue", () => chooseLoader("java")]]
                            ],
                            ["bedrock_vanilla",
                                "/bedrock-icon-small.png",
                                [["Continue", () => chooseLoader("bedrock")]],
                                "coming soon"
                            ],
                            "divide:Third Party Modpacks",
                            ["curseforge",
                                "/curseforge-icon.svg",
                                [
                                    ["Import ZIP", null, true, "secondary"],
                                    ["Search", () => loadModpacks(API.CurseForge.Modpacks), true]
                                ],
                                "coming back soon"
                            ],
                            ["ftb",
                                "/ftb-icon.png",
                                [["Search", () => loadModpacks(API.FeedTheBeast.Modpacks), true]],
                                "coming back soon"
                            ],
                            ["modrinth",
                                "/modrinth-icon.svg",
                                [["Search", () => loadModpacks(API.Modrinth.Modpacks), true]],
                                "coming soon"
                            ],
                            "divide:Third Party Modloaders",
                            ["forge",
                                LoaderIcons.forge,
                                [["Continue", () => chooseLoader("forge")]],
                                "unstable"
                            ],
                            ["fabric",
                                LoaderIcons.fabric,
                                [["Continue", () => chooseLoader("fabric")]]
                            ],
                            ["fabric2",
                                LoaderIcons.quilt,
                                [["Continue", () => chooseLoader("quilt")]],
                                "beta software"
                            ],
                            "divide:Other",
                            ["import",
                                "img/icons/brand_default.svg",
                                [["Import", importInstance]]
                            ],
                            ["import2",
                                "img/icons/brand_default.svg",
                                [["Import", () => null, true]]
                            ]
                        ]} backButton={
                            <Button theme="secondary" css={{ left: 16, bottom: 16, position: "fixed" }} onClick={selectBackToHome}>
                                <ArrowLeft/>
                                Back to Instances
                            </Button>
                        }/>
                    : page === 'setup-loader' ?
                        <LoaderSetup install={installLoader} loader={settingUp} versions={loaderVersions} backButton={
                            <Button theme="secondary" onClick={setupBackToSelect}>
                                <ArrowLeft/>
                                Select Another Loader
                            </Button>
                        }/>
                    : page === 'settings' ?
                        <Settings close={selectBackToHome}/>
                    : page === 'news' ?
                        <News render={page === 'news'} backButton={
                            <Button theme="secondary" onClick={selectBackToHome}>
                                <ArrowLeft/>
                                Back to Home
                            </Button>
                        }/>
                    : null}
                </Main>
                <Toaster position="bottom-right"/>
        </App>
    );
};