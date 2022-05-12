import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer/';
import { styled } from '@stitches/react';
import { open } from '@tauri-apps/api/dialog';
import toast, { Toaster } from 'react-hot-toast';
import { PlusLg, GearFill, ArrowLeft } from 'react-bootstrap-icons';
import { MinecraftSkinViewer } from '@yannichock/react-minecraft-skin-viewer';

import App from '/src/components/App';
import News from '../components/News';
import Main from '/voxeliface/components/Main';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Header from '/src/components/Header';
import Button from '/voxeliface/components/Button';
import Settings from '../components/Settings';
import SkinList from '../components/SkinList';
import LoaderSetup from '../components/LoaderSetup';
import * as Dialog from '/voxeliface/components/Dialog';
import InstanceList from '../components/InstanceList';
import InstancePage from '../components/InstancePage';

import SelectInstanceType from '../components/SelectInstanceType';

import API from '../common/api';
import Util from '../common/util';
import Instances from '../common/instances';
import LocalStrings from '../localization/strings';
import { LoaderIcons, QUILT_API_BASE, FABRIC_API_BASE, FORGE_VERSION_MANIFEST, MINECRAFT_VERSION_MANIFEST } from '../common/constants';

const TopButton = styled('button', {
    flex: 1,
    color: '$secondaryColor',
    border: 'none',
    padding: '.25rem 0',
    fontSize: '.8rem',
    fontWeight: 400,
    background: 'none',
    fontFamily: 'Nunito',
    transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1), background 250ms cubic-bezier(0.4, 0, 0.2, 1)',

    '&:hover': {
        color: '$primaryColor',
        background: '$secondaryBackground2'
    },
    variants: {
        selected: {
            true: {
                color: '$primaryColor',
                fontWeight: 500
            }
        }
    }
});

export default function Home() {
    const [_, setBruh] = useState(0);
    const [skin, setSkin] = useState();
    const [page, setPage] = useState('home');
    const [loading, setLoading] = useState(false);
    const [instance, setInstance] = useState();
    const [fullPage, setFullPage] = useState('instances');
    const [instances, setInstances] = useState();
    const [settingUp, setSettingUp] = useState();
    const [addSkinImage, setAddSkinImage] = useState();
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
    const chooseSkinImage = () => {
        open({
            filters: [{ name: 'All files', extensions: ['png'] }]
        }).then(path => {
            if(!path)
                return toast.error('Invalid image path');
            Util.readBinaryFile(path).then(binary =>
                setAddSkinImage(Buffer.from(binary).toString('base64'))
            );
        })
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
        try {
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
        } catch(err) {
            setLoading(false);
            return toast.error(err.message);
        }
        setSettingUp(loader);
        setLoading(false);
        setPage('setup-loader');
    };
    const selectSkin = () => {

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
                        <Grid background="$secondaryBackground" css={{
                            borderBottom: '1px solid $secondaryBorder2'
                        }}>
                            <TopButton onClick={() => setFullPage('instances')} selected={fullPage === 'instances'}>
                                Instances
                            </TopButton>
                            <TopButton onClick={() => setFullPage('skins')} selected={fullPage === 'skins'}>
                                Skins
                            </TopButton>
                            <TopButton onClick={() => setFullPage('news')} selected={fullPage === 'news'}>
                                News
                            </TopButton>
                        </Grid>
                        {
                            fullPage === 'instances' ?
                                <InstanceList selected={instance} onSelect={selectInstance} instances={instances}/>
                            : fullPage === 'skins' ?
                                <SkinList selected={skin} onSelect={selectSkin}/>
                            : null
                        }
                        <Grid width="100%" spacing="1rem" background="$secondaryBackground" alignItems="center" justifyContent="center" css={{
                            minHeight: 64
                        }}>
                            {fullPage === 'instances' ?
                                <Button onClick={addInstancePage}>
                                    <PlusLg/>
                                    {LocalStrings['app.mdpkm.home.sidebar.buttons.add_instance']}
                                </Button>
                            : fullPage === 'skins' ?
                                <Dialog.Root>
                                    <Dialog.Trigger asChild>
                                        <Button>
                                            <PlusLg/>
                                            Add New Skin
                                        </Button>
                                    </Dialog.Trigger>
                                    <Dialog.Content>
                                        <Dialog.Title>Add new Minecraft Skin</Dialog.Title>
                                        <Dialog.Description>
                                            This action will literally murder you.
                                        </Dialog.Description>
                                        <Grid width="fit-content" spacing={8} direction="vertical" alignItems="center">
                                            <Grid background="$secondaryBackground2" borderRadius={8} css={{ overflow: 'hidden' }}>
                                                {addSkinImage &&
                                                    /*<Image src={`data:image/png;base64,${addSkinImage}`} size={96} css={{
                                                        imageRendering: 'pixelated'
                                                    }}/>*/
                                                    <MinecraftSkinViewer
                                                        skin={`data:image/png;base64,${addSkinImage}`}
                                                        width={128}
                                                        height={128}
                                                        background="transparent"
                                                    />
                                                }
                                            </Grid>
                                            <Button theme="secondary" onClick={chooseSkinImage}>
                                                Choose image
                                            </Button>
                                        </Grid>
                                        <Grid margin="25 0 0" justifyContent="end">
                                            <Dialog.Close asChild>
                                                <Button size="medium">
                                                    Add Skin
                                                </Button>
                                            </Dialog.Close>
                                        </Grid>
                                    </Dialog.Content>
                                </Dialog.Root>
                            : null}
                            <Button theme="secondary" onClick={settingsPage}>
                                <GearFill/>
                                {LocalStrings['app.mdpkm.home.sidebar.buttons.settings']}
                            </Button>
                        </Grid>
                    </Grid>
                    {fullPage === 'instances' && page === 'home' &&
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