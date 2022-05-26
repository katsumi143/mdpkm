import React, { useEffect, useState } from 'react';
import { Buffer } from 'buffer/';
import { styled } from '@stitches/react';
import { useDispatch } from 'react-redux';
import { open } from '@tauri-apps/api/dialog';
import * as shell from '@tauri-apps/api/shell';
import { listen } from '@tauri-apps/api/event';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import { relaunch } from '@tauri-apps/api/process';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { XLg, PlusLg, Github, Download, GearFill, ArrowLeft } from 'react-bootstrap-icons';
import { MinecraftSkinViewer } from '@yannichock/react-minecraft-skin-viewer';

import App from '/src/components/App';
import News from '../components/News';
import Main from '/voxeliface/components/Main';
import Grid from '/voxeliface/components/Grid';
import Pages from '/src/components/Pages';
import Header from '/src/components/Header';
import Button from '/voxeliface/components/Button';
import Settings from '/src/components/Settings';
import SkinList from '/src/components/SkinList';
import PageItem from '/src/components/Pages/Item';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import LoaderSetup from '/src/components/LoaderSetup';
import * as Dialog from '/voxeliface/components/Dialog';
import ModpackSetup from '/src/components/ModpackSetup';
import InstanceList from '/src/components/InstanceList';
import InstancePage from '/src/components/InstancePage';
import ImportInstance from '/src/components/ImportInstance';

import SelectInstanceType from '/src/components/SelectInstanceType';

import API from '/src/common/api';
import Util from '/src/common/util';
import Instances from '/src/common/instances';
import { addSkin, saveSkins } from '/src/common/slices/skins';

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

let updateListener;
export default function Home() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [_, setBruh] = useState(0);
    const [skin, setSkin] = useState();
    const [page, setPage] = useState('home');
    const [update, setUpdate] = useState();
    const [loading, setLoading] = useState(false);
    const [instance, setInstance] = useState();
    const [fullPage, setFullPage] = useState('instances');
    const [settingUp, setSettingUp] = useState();
    const [importPath, setImportPath] = useState();
    const [addSkinName, setAddSkinName] = useState();
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
        setPage('import-instance');
        setLoading(false);
    };
    const selectInstance = id => setInstance(id);
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
            if(loader === 'bedrock') {
                const versions = await API.Minecraft.Bedrock.getLoaderVersions();
                console.log(versions);

                setLoaderVersions(versions);
            } else if(loader === 'modpack') {
                setLoading(false);
                setPage('modpack-setup');
                return;
            } else {
                const loaderData = API.getLoader(loader);
                if(!loaderData)
                    throw new Error(`Invalid Loader: ${loader}`);
                const versions = await loaderData.source.getVersions();
                setLoaderVersions(versions);
            }
        } catch(err) {
            setLoading(false);
            return toast.error(`Failed to load ${loader};\n${err}`);
        }
        setSettingUp(loader);
        setLoading(false);
        setPage('setup-loader');
    };
    const importModpack = path => {
        setImportPath(path);
        setPage('import-instance');
    };
    const selectSkin = () => {

    };
    const addNewSkin = () => {
        dispatch(addSkin({
            name: addSkinName,
            image: addSkinImage
        }));
        dispatch(saveSkins());
    };
    const updateApp = () => {
        setUpdate({
            ...update,
            updating: true
        });
        installUpdate().then(() => relaunch());
    };
    useEffect(() => {
        if (!updateListener)
            updateListener = listen('tauri://update-available', ({ payload }) => {
                console.log('New version available: ', payload);
                setUpdate(payload);
            }).then(unlisten => {
                updateListener = unlisten;
                checkUpdate();
            });
    });

    return (
        <App>
            <Header icon="/text.png"/>
                <Main css={{
                    padding: 0,
                    overflow: 'hidden auto',
                    flexDirection: 'row'
                }}>
                    {update &&
                        <Grid width="100%" height="100%" direction="vertical" alignItems="center" background="#00000099" justifyContent="center" css={{
                            top: 0,
                            left: 0,
                            zIndex: 100000,
                            position: 'absolute'
                        }}>
                            <Grid width="40%" height="35%" padding={12} direction="vertical" background="$secondaryBackground" borderRadius={8} css={{
                                border: '1px solid $secondaryBorder2',
                                position: 'relative'
                            }}>
                                <Typography size="1.2rem" color="$primaryColor" weight={600} family="Nunito Sans">
                                    New Update Available
                                </Typography>
                                <Typography size=".9rem" color="$primaryColor" weight={400} family="Nunito">
                                    Version {update.version}
                                </Typography>

                                <Typography size=".9rem" color="$primaryColor" weight={400} margin="1rem 0 0" family="Nunito">
                                    Release notes:
                                </Typography>
                                <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito">
                                    {update.body}
                                </Typography>

                                <Grid margin="8px 0 0" spacing={8} css={{
                                    bottom: 12,
                                    position: 'absolute'
                                }}>
                                    <Button theme="accent" onClick={updateApp} disabled={update.updating}>
                                        {update.updating ? <BasicSpinner size={16}/> : <Download size={14}/>}
                                        Install Update
                                    </Button>
                                    <Button theme="secondary" onClick={() => setUpdate()} disabled={update.updating}>
                                        <XLg/>
                                        Later
                                    </Button>
                                </Grid>
                                <Button theme="secondary" onClick={() => shell.open(`https://github.com/Blookerss/mdpkm/releases/tag/v${update.version}`)} css={{
                                    right: 12,
                                    bottom: 12,
                                    position: 'absolute'
                                }}>
                                    <Github size={14}/>
                                    View Release
                                </Button>
                            </Grid>
                        </Grid>
                    }
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
                        </Grid>
                        {
                            fullPage === 'instances' ?
                                <InstanceList id={instance} onSelect={selectInstance}/>
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
                                    {t('app.mdpkm.home.sidebar.buttons.add_instance')}
                                </Button>
                            : fullPage === 'skins' ?
                                <Dialog.Root>
                                    <Dialog.Trigger asChild>
                                        <Button onClick={() => setAddSkinImage()}>
                                            <PlusLg/>
                                            {t('app.mdpkm.home.sidebar.buttons.add_skin')}
                                        </Button>
                                    </Dialog.Trigger>
                                    <Dialog.Content>
                                        <Dialog.Title>Add new Minecraft Skin</Dialog.Title>
                                        <Grid spacing={4} direction="vertical">
                                            <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito">
                                                Skin Name
                                            </Typography>
                                            <TextInput value={addSkinName} onChange={setAddSkinName} placeholder="Enter a name"/>
                                        </Grid>
                                        <Grid width="fit-content" margin="8px 0 0" spacing={8} direction="vertical">
                                            <Grid background="$secondaryBackground2" borderRadius={8} css={{ overflow: 'hidden' }}>
                                                {addSkinImage &&
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
                                        <Grid margin="16px 0 0" justifyContent="end">
                                            <Dialog.Close asChild>
                                                <Button onClick={addNewSkin} disabled={!addSkinName || !addSkinImage}>
                                                    Add Skin
                                                </Button>
                                            </Dialog.Close>
                                        </Grid>
                                    </Dialog.Content>
                                </Dialog.Root>
                            : null}
                            <Button theme="secondary" onClick={settingsPage}>
                                <GearFill/>
                                {t('app.mdpkm.home.sidebar.buttons.settings')}
                            </Button>
                        </Grid>
                    </Grid>
                    {fullPage === 'instances' && page === 'home' &&
                        !Instances.gettingInstances &&
                        <InstancePage id={instance}/>
                    }
                    {page !== 'home' && <Grid width="100%" height="100%" css={{ position: 'relative' }}>
                        <Pages value={page}>
                            <PageItem value="add-instance">
                                <SelectInstanceType
                                    back={selectBackToHome}
                                    types={API.instanceTypes}
                                    loading={loading}
                                    chooseLoader={chooseLoader}
                                    importInstance={importInstance}
                                />
                            </PageItem>
                            <PageItem value="setup-loader">
                                <LoaderSetup
                                    back={setupBackToSelect}
                                    loader={settingUp}
                                    install={installLoader}
                                    versions={loaderVersions}
                                />
                            </PageItem>
                            <PageItem value="modpack-setup">
                                <ModpackSetup back={setupBackToSelect} importModpack={importModpack}/>
                            </PageItem>
                            <PageItem value="import-instance">
                                <ImportInstance path={importPath} back={setupBackToSelect}/>
                            </PageItem>
                            <PageItem value="settings">
                                <Settings close={selectBackToHome}/>
                            </PageItem>
                            <PageItem value="news">
                                <News render={page === 'news'} backButton={
                                    <Button theme="secondary" onClick={selectBackToHome}>
                                        <ArrowLeft/>
                                        Back to Home
                                    </Button>
                                }/>
                            </PageItem>
                        </Pages>
                    </Grid>}
                </Main>
                <Toaster position="bottom-right" toastOptions={{
                    style: {
                        color: 'var(--colors-primaryColor)',
                        fontSize: '.9rem',
                        background: 'var(--colors-secondaryBackground)'
                    }
                }}/>
        </App>
    );
};