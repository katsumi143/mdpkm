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
import { XLg, Gear, PlusLg, Github, Archive, Download, GearFill, ArrowLeft, Newspaper, PersonBadge } from 'react-bootstrap-icons';
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
import Markdown from '/voxeliface/components/Markdown';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import LoaderSetup from '/src/components/LoaderSetup';
import * as Dialog from '/voxeliface/components/Dialog';
import ModpackSetup from '/src/components/ModpackSetup';
import InstanceList from '/src/components/InstanceList';
import InstancePage from '/src/components/InstancePage';
import ImportInstance from '/src/components/ImportInstance';
import SideNavigation from '/voxeliface/components/SideNavigation';
import NavigationItem from '/voxeliface/components/SideNavigation/Item';
import SelectInstanceType from '/src/components/SelectInstanceType';

import API from '/src/common/api';
import Util from '/src/common/util';
import Instances from '/src/common/instances';
import { addSkin, saveSkins } from '/src/common/slices/skins';

let updateListener;
export default function Home() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [_, setBruh] = useState(0);
    const [skin, setSkin] = useState();
    const [page, setPage] = useState(0);
    const [update, setUpdate] = useState();
    const [loading, setLoading] = useState(false);
    const [instance, setInstance] = useState();
    const [settingUp, setSettingUp] = useState();
    const [importPath, setImportPath] = useState();
    const [addSkinName, setAddSkinName] = useState();
    const [addSkinImage, setAddSkinImage] = useState();
    const [instancePage, setInstancePage] = useState('home');
    const [loaderVersions, setLoaderVersions] = useState();
    const setupBackToSelect = () => {
        setInstancePage('add-instance');
        setLoaderVersions();
        setSettingUp();
    };
    const selectBackToHome = () => setInstancePage('home');
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
        setInstancePage('import');
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
        setInstancePage('home');
        setInstance(Instances.instances.findIndex(i => i.name === name));
        setSettingUp();
        setLoaderVersions();
    };
    const chooseLoader = async loader => {
        setLoading(true);
        try {
            if(loader === 'bedrock') {
                const versions = await API.Minecraft.Bedrock.getLoaderVersions();
                console.log(versions);

                setLoaderVersions(versions);
            } else if(loader === 'modpack') {
                setInstancePage('modpack-setup');
                setLoading(false);
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
        setInstancePage('setup-loader');
        setSettingUp(loader);
        setLoading(false);
    };
    const importModpack = path => {
        setInstancePage('import');
        setImportPath(path);
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
                            <Grid width="45%" height="45%" padding={12} direction="vertical" background="$secondaryBackground" borderRadius={8} css={{
                                border: '1px solid $secondaryBorder2',
                                position: 'relative'
                            }}>
                                <Typography size="1.2rem" color="$primaryColor" weight={600} family="Nunito Sans">
                                    New Update Available
                                </Typography>
                                <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito">
                                    Version {update.version} - Released {new Intl.RelativeTimeFormat('en', {
                                        numeric: 'always' 
                                    }).format(-Math.round((Date.now() - new Date(update.date)) / 86400000), 'day')}
                                </Typography>

                                <Typography size=".9rem" color="$primaryColor" weight={400} margin="1rem 0 0" family="Nunito">
                                    Release notes:
                                </Typography>
                                <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" css={{
                                    padding: '.5rem .75rem',
                                    overflow: 'hidden auto',
                                    background: '$secondaryBackground2',
                                    alignItems: 'start',
                                    borderRadius: 8,
                                    flexDirection: 'column',

                                    '& > *:first-child': {
                                        color: '$primaryColor',
                                        marginTop: 0
                                    },
                                    '& > *:last-child': {
                                        marginBottom: 0
                                    },
                                    '& h2': {
                                        fontSize: '1.4em',
                                        marginTop: 24,
                                        marginBottom: '1rem',
                                        borderBottom: '1px solid $tagBorder',
                                        paddingBottom: '.3em'
                                    },
                                    '& p, & blockquote, & ul, & ol, & dl, & table, & pre, & details': {
                                        margin: '0 0 1rem'
                                    },
                                    '& ul': {
                                        paddingLeft: '2em'
                                    }
                                }}>
                                    <ReactMarkdown>{update.body}</ReactMarkdown>
                                </Typography>
                                <Markdown text={update.body} css={{
                                    padding: '.5rem .75rem',
                                    overflow: 'hidden auto',
                                    background: '$secondaryBackground2',
                                    borderRadius: 8,
                                    flexDirection: 'row'
                                }}/>

                                <Grid margin="8px 0 0" spacing={8}>
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
                    <SideNavigation value={page} onChange={setPage}>
                        <NavigationItem name={t('app.mdpkm.home.navigation.instances')} icon={<Archive size={16}/>} value={0} direction="horizontal">
                            <Pages value={instancePage}>
                                <PageItem value="home">
                                    <Grid width="35%" height="100%" direction="vertical" background="$blackA2" justifyContent="space-between" css={{
                                        maxWidth: '35%',
                                        borderRight: '1px solid $secondaryBorder'
                                    }}>
                                        <InstanceList id={instance} onSelect={selectInstance}/>
                                        <Grid width="100%" spacing="1rem" background="$secondaryBackground" alignItems="center" justifyContent="center" css={{
                                            minHeight: 64
                                        }}>
                                            <Button onClick={() => setInstancePage('add-instance')}>
                                                <PlusLg size={14}/>
                                                {t('app.mdpkm.buttons.add_instance')}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    <InstancePage id={instance}/>
                                </PageItem>
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
                                <PageItem value="import">
                                    <ImportInstance path={importPath} back={setupBackToSelect}/>
                                </PageItem>
                            </Pages>
                        </NavigationItem>
                        {/*<NavigationItem name={t('app.mdpkm.home.navigation.skins')} icon={<PersonBadge size={16}/>} value={1}>
                            skins
                        </NavigationItem>*/}
                        {/*<NavigationItem name={t('app.mdpkm.home.navigation.news')} icon={<Newspaper size={16}/>} value={2}>
                            news
                        </NavigationItem>*/}
                        <NavigationItem name={t('app.mdpkm.home.navigation.settings')} icon={<Gear size={16}/>} value={3} footer>
                            <Settings/>
                        </NavigationItem>
                    </SideNavigation>
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