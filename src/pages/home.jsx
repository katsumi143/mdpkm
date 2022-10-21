import * as shell from '@tauri-apps/api/shell';
import { listen } from '@tauri-apps/api/event';
import { relaunch } from '@tauri-apps/api/process';
import { useTranslation } from 'react-i18next';
import toast, { Toaster } from 'react-hot-toast';
import React, { useEffect, useState } from 'react';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';

import App from '/src/components/App';
import Main from '/voxeliface/components/Main';
import Grid from '/voxeliface/components/Grid';
import Pages from '/src/components/Pages';
import Modal from '/src/components/Modal';
import Header from '/src/components/Header';
import Button from '/voxeliface/components/Button';
import Settings from '/src/components/Settings';
import Accounts from '/src/components/Accounts';
import PageItem from '/src/components/Pages/Item';
import Markdown from '/voxeliface/components/Markdown';
import Downloads from '../components/Downloads';
import Typography from '/voxeliface/components/Typography';
import LoaderSetup from '/src/components/LoaderSetup';
import ModpackSetup from '/src/components/ModpackSetup';
import InstanceList from '/src/components/InstanceList';
import InstancePage from '/src/components/InstancePage';
import ImportInstance from '/src/components/ImportInstance';
import SkinManagement from '/src/components/SkinManagement';
import SideNavigation from '/voxeliface/components/SideNavigation';
import NavigationItem from '/voxeliface/components/SideNavigation/Item';
import SelectInstanceType from '/src/components/SelectInstanceType';

import API from '/src/common/api';
import voxura from '../common/voxura';
import Patcher from '/src/common/plugins/patcher';

let updateListener;
export default Patcher.register(function Home() {
    const { t } = useTranslation();
    const [page, setPage] = useState(0);
    const [update, setUpdate] = useState();
    const [loading, setLoading] = useState(false);
    const [instance, setInstance] = useState();
    const [settingUp, setSettingUp] = useState();
    const [importPath, setImportPath] = useState();
    const [instancePage, setInstancePage] = useState('home');
    const [loaderVersions, setLoaderVersions] = useState();
    const setupBackToSelect = () => {
        setInstancePage('add-instance');
        setLoaderVersions();
        setSettingUp();
    };
    const selectBackToHome = () => setInstancePage('home');
    const importInstance = () => {
        setInstancePage('import');
        setLoading(false);
    };
    const selectInstance = id => setInstance(id);
    const installLoader = async(name, loader, gameVersion, loaderVersion, setState) => {
        setState('Preparing...');
        /*await Instances.installInstanceWithLoader(name, loader, gameVersion, loaderVersion, setState).catch(err => {
            console.error(err);
            toast.error(`Instance Installation Failed!\n${err.message ?? 'Unknown Reason.'}`);
        });*/
        const instance = await voxura.instances.createInstance(name);
        await instance.changeLoader(loader, loaderVersion);
        await instance.changeVersion(gameVersion);

        toast.success(`${name} was created successfully.`);
        setInstancePage('home');
        setInstance(instance.id);
        setSettingUp();
        setLoaderVersions();
    };
    const chooseLoader = async loader => {
        setLoading(true);
        try {
            if(loader === 'bedrock') {
                const versions = await API.Minecraft.Bedrock.getLoaderVersions();
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
                    <Modal>
                        <Typography size="1.2rem" weight={600} family="$primaryFontSans">
                            New Update Available
                        </Typography>
                        <Typography size=".9rem" color="$secondaryColor" weight={400}>
                            Version {update.version} - Released {new Date(update.date).getTime() ? new Intl.RelativeTimeFormat('en', {
                                numeric: 'always' 
                            }).format(-Math.round((Date.now() - new Date(update.date)) / 86400000), 'day') : 'at an unknown date'}
                        </Typography>

                        <Typography size=".9rem" weight={400} margin="1rem 0 0">
                            Release notes:
                        </Typography>
                        <Markdown text={update.body} css={{
                            padding: '.5rem .75rem',
                            overflow: 'hidden auto',
                            background: '$secondaryBackground2',
                            borderRadius: 8
                        }}/>

                        <Grid margin="2rem 0 0" justifyContent="space-between">
                            <Grid spacing={8}>
                                <Button theme="accent" onClick={updateApp} disabled={update.updating}>
                                    {update.updating ? <BasicSpinner size={16}/> : <Download size={14}/>}
                                    Install Update
                                </Button>
                                <Button theme="secondary" onClick={() => setUpdate()} disabled={update.updating}>
                                    <XLg/>
                                    Later
                                </Button>
                            </Grid>
                            <Button theme="secondary" onClick={() => shell.open(`https://github.com/Blookerss/mdpkm/releases/tag/v${update.version}`)}>
                                <Github size={14}/>
                                View Release
                            </Button>
                        </Grid>
                    </Modal>
                }
                <SideNavigation value={page} onChange={setPage}>
                    <NavigationItem name={t('app.mdpkm.home.navigation.instances')} icon={<IconBiListUl size={16}/>} value={0} direction="horizontal">
                        <Pages value={instancePage}>
                            <PageItem value="home">
                                <Grid width="35%" height="100%" direction="vertical" background="$blackA2" justifyContent="space-between" css={{
                                    maxWidth: '35%',
                                    borderRight: '1px solid $secondaryBorder'
                                }}>
                                    <InstanceList id={instance} onSelect={selectInstance}/>
                                    <Grid width="100%" padding={16} background="$secondaryBackground" alignItems="center" justifyContent="center">
                                        <Button onClick={() => setInstancePage('add-instance')}>
                                            <IconBiPlusLg size={14}/>
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
                    <NavigationItem name={t('app.mdpkm.home.navigation.skins')} icon={<IconBiPersonBadge size={16}/>} value={1}>
                        <SkinManagement/>
                    </NavigationItem>
                    {/*<NavigationItem name={t('app.mdpkm.home.navigation.news')} icon={<Newspaper size={16}/>} value={2}>
                        news
                    </NavigationItem>*/}
                    <NavigationItem name={t('app.mdpkm.home.navigation.downloads')} icon={<IconBiDownload size={16}/>} value={3} footer>
                        <Downloads/>
                    </NavigationItem>
                    <NavigationItem name={t('app.mdpkm.home.navigation.accounts')} icon={<IconBiPerson size={16}/>} value={4} footer>
                        <Accounts/>
                    </NavigationItem>
                    <NavigationItem name={t('app.mdpkm.home.navigation.settings')} icon={<IconBiGear size={16}/>} value={5} footer>
                        <Settings/>
                    </NavigationItem>
                </SideNavigation>
            </Main>
            <Toaster position="bottom-right"/>
        </App>
    );
});