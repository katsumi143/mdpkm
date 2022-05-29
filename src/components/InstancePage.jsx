import React, { useEffect, useState } from 'react';
import nbt from 'nbt';
import toast from 'react-hot-toast';
import { keyframes } from '@stitches/react';
import { open } from '@tauri-apps/api/shell';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { PlusLg, PlayFill, FileText, PencilFill, Trash3Fill, Folder2Open, FolderFill, FiletypePng, FiletypeJpg, FiletypeSvg, FiletypeTxt, FiletypeJson, CloudArrowDown, ArrowClockwise, ExclamationCircleFill, FileEarmarkZip, Save2 } from 'react-bootstrap-icons';

import Mod from './Mod';
import Tag from './Tag';
import Tabs from '/voxeliface/components/Tabs';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Toggle from './Toggle';
import Button from '/voxeliface/components/Button';
import Slider from '/voxeliface/components/Input/Slider';
import Spinner from '/voxeliface/components/Spinner';
import Divider from '/voxeliface/components/Divider';
import TabItem from '/voxeliface/components/Tabs/Item';
import TextInput from '/voxeliface/components/Input/Text';
import ModSearch from './ModSearch';
import Typography from '/voxeliface/components/Typography';
import InstanceMod from './InstanceMod';
import * as Dialog from '/voxeliface/components/Dialog';
import InstanceIcon from './InstanceIcon';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import TextTransition from './Transition/Text';
import ImageTransition from './Transition/Image';

import API from '../common/api';
import Util from '../common/util';
import Instances from '../common/instances';
import { saveAccounts, writeAccount } from '../common/slices/accounts';
import { LoaderStates, DisabledLoaders } from '../common/constants';

const totalMemory = await Util.getTotalMemory();
export default function InstancePage({ id }) {
    const { t } = useTranslation();
    const instance = useSelector(state => state.instances.data.find(i => i.id === id));
    const { name, path, config, modpack, minState } = instance ?? {};
    const loaderData = API.getLoader(config?.loader?.type);
    const versionBanner = (loaderData?.versionBanners ?? API.getLoader('java')?.versionBanners)?.find(v => v?.[0].test(config?.loader?.game));
    const loaderDisabled = DisabledLoaders.some(d => d === config?.loader?.type);

    let mods = instance?.mods;
    const Account = Util.getAccount(useSelector);
    const dispatch = useDispatch();
    const logErrors = instance?.launchLogs?.filter(({ type }) => type === 'ERROR');
    const [saving, setSaving] = useState(false);
    const [servers, setServers] = useState();
    const [tabPage, setTabPage] = useState(0);
    const [modPage, setModPage] = useState(0);
    const [instance2, setInstance2] = useState();
    const [modFilter, setModFilter] = useState('');
    const [launchable, setLaunchable] = useState();
    const [exportFiles, setExportFiles] = useState();
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [instanceRam, setInstanceRam] = useState(instance?.config?.ram ?? 2);
    const [serverFilter, setServerFilter] = useState('');
    const [instanceName, setInstanceName] = useState(name);
    const [resourcePacks, setResourcePacks] = useState();
    const saveSettings = async() => {
        setSaving(true);

        const Instance = Instances.getInstance(id);
        if (instanceName !== instance.name) {
            const originalPath = path.toString();
            const splitPath = path.split(/\/+|\\+/g);
            splitPath.reverse()[0] = instanceName;

            Instance.name = instanceName;
            Instance.path = splitPath.reverse().join('/');
            await Util.moveFolder(originalPath, Instance.path);
        }

        await Instance.saveConfig({
            ...await Instance.getConfig(),
            ram: instanceRam
        });
        Instance.updateStore();
        setSaving(false);
    };
    const viewModpackSite = () => open(modpack.websiteUrl);
    const exportInstance = () => Instances.exportInstance(id, exportFiles.filter(e => e.selected).map(e => e.path));
    const deleteInstance = () => {
        setServers();
        setLaunchable();
        setExportFiles();
        setInstanceName();
        setResourcePacks();
        Instances.getInstance(id).delete();
    };
    const launchInstance = async() => {
        const [verifiedAccount, changed] = await toast.promise(API.Minecraft.verifyAccount(Account), {
            error: 'Failed to verify account',
            success: 'Minecraft Account verified',
            loading: `Verifying tokens for '${Account.profile.name}'`
        });
        if(changed) {
            dispatch(writeAccount(verifiedAccount));
            dispatch(saveAccounts());
        }
        const Instance = Instances.getInstance(id);
        if (Instance)
            Instance.launch(verifiedAccount).catch(err => {
                console.error(err);
                toast.error(`Failed to launch ${instance.name}!\n${err.message ?? 'Unknown Reason.'}`);
            });
        else
            toast.error(`getInstance failed.\nTry refreshing your instances.`);
    }
    const getExportFiles = async() => {
        if(!instance) return;
        if (!instance?.path)
            return toast.error('Invalid path');
        const files = await Util.readDirRecursive(instance.path);
        setExportFiles(files.map(file => {
            file.banned = [
                'icon\\.(png|jpg|svg)',
                'dashloader-cache',
                'modcache.json',
                'modpack.json',
                'config.json',
                '.ReAuth.cfg',
                '.mixin.out',
                'essential',
                '.fabric',
                'natives',
                'mods'
            ].some(name => new RegExp(`^${name}$`).test(file.name) || new RegExp(`^/${name}/`).test(file.path.replace(instance.path, '').replace(/\/+|\\+/g, '/')));
            file.sensitive = [
                'crash-reports',
                'logs'
            ].indexOf(file.name) >= 0;
            file.selected = [
                'icon\\.(png|jpg|svg)',
                'modpack.json',
                'config.json',
                'options.txt',
                'config',
                'mods'
            ].some(name => new RegExp(`^${name}$`).test(file.name) || new RegExp(`^/${name}/`).test(file.path.replace(/\/+|\\+/g, '/').replace(instance.path.replace(/\/+|\\+/g, '/'), '')));
            return file;
        }));
    };
    const refreshMods = () => {
        const Instance = Instances.getInstance(id);
        Instance.getMods().then(mods => {
            Instance.mods = mods;
            Instance.updateStore();
        });
    };
    const getResourcePacks = async() => {
        if(!instance?.path)
            return;
        const path = `${instance.path}/resourcepacks`;
        setResourcePacks('loading');
        if(await Util.fileExists(path)) {
            const files = await Util.readDir(path);
            const resourcePacks = [];
            for (const { name, path, isDir } of files) {
                try {
                    if(isDir) {
                        const icon = await Util.readFileBase64(`${path}/pack.png`).catch(console.warn);
                        const metadata = await Util.readTextFile(`${path}/pack.mcmeta`).then(JSON.parse);
                        resourcePacks.push({
                            name,
                            icon,
                            metadata
                        });
                    } else if(name.endsWith('.zip')) {
                        const icon = await Util.readFileInZipBase64(path, 'pack.png').catch(console.warn);
                        const metadata = await Util.readFileInZip(path, 'pack.mcmeta').then(JSON.parse);
                        resourcePacks.push({
                            name,
                            icon,
                            metadata
                        });
                    }
                } catch(err) {
                    console.warn(err);
                }
            }
            setResourcePacks(resourcePacks);
        } else {
            console.warn('servers.dat not found');
            setResourcePacks([]);
        }
    };
    const getServers = async() => {
        if(!instance?.path)
            return;
        const path = `${instance.path}/servers.dat`;
        setServers('loading');
        if(await Util.fileExists(path)) {
            const data = await Util.readBinaryFile(path);
            nbt.parse(data, (error, data) => {
                if(error)
                    throw error;
                setServers(data.value.servers.value.value);
            });
        } else {
            console.warn('servers.dat not found');
            setServers([]);
        }
    };
    const openFolder = () => open(path);

    useEffect(() => {
        if(!exportFiles)
            getExportFiles();
    }, [exportFiles]);
    useEffect(() => {
        if(!resourcePacks)
            getResourcePacks();
    }, [resourcePacks]);
    useEffect(() => {
        if(!servers)
            getServers();
    }, [servers]);
    useEffect(() => {
        if(typeof launchable !== 'boolean') {
            const { type, game, version } = config?.loader ?? {};
            const loaderType = Util.getLoaderType(type);
            if(loaderType === 'unknown')
                Util.fileExists(
                    `${Instances.getPath('versions')}/${type}-${game}-${version}/manifest.json`
                ).then(setLaunchable);
            else
                setLaunchable(true);
        }
    }, [launchable]);
    useEffect(() => {
        if(instance2 !== instance?.id) {
            setServers();
            setLaunchable();
            setExportFiles();
            setInstanceName(name);
            setResourcePacks();
        }
        setInstance2(instance?.id);
    });

    if(!instance)
        return 'invalid';
    return (
        <Grid width="-webkit-fill-available" margin="0 0 0 35%" height="100%" direction="vertical" css={{
            flex: 1
        }}>
            <Grid margin="1rem" padding={12} background="$secondaryBackground2" borderRadius={16} css={{
                position: 'relative'
            }}>
                <InstanceIcon size={80} instance={instance} hideLoader props={{
                    css: {
                        zIndex: 2,
                        background: '$primaryBackground',
                        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                        '&:hover': {
                            zIndex: 3,
                            minWidth: 144,
                            position: 'absolute',
                            minHeight: 144
                        }
                    }
                }}/>
                <Grid margin="0 0 0 1.2rem" spacing={6} direction="vertical" justifyContent="center">
                    <Typography size="1.3rem" color="$primaryColor" weight={600} family="Nunito" lineheight={1}>
                        <TextTransition inline>{name}</TextTransition>
                    </Typography>
                    <Typography color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        <TextTransition inline noOverflow>{minState ?? 'Installed'}</TextTransition>
                    </Typography>
                </Grid>
                <Grid spacing={8} alignItems="center" css={{
                    right: 12,
                    bottom: 12,
                    position: 'absolute'
                }}>
                    <Button theme="secondary" onClick={openFolder}>
                        <Folder2Open/>
                        {t('app.mdpkm.common:actions.open_folder')}
                    </Button>
                    <Button onClick={launchInstance} disabled={loaderDisabled || !!minState || !Account}>
                        {!!minState ? <BasicSpinner size={16}/> : <PlayFill/>}
                        {t('app.mdpkm.common:actions.launch')}
                    </Button>
                </Grid>
                <Tag css={{
                    right: 12,
                    position: 'absolute'
                }}>
                    {loaderData?.icon ?
                        <ImageTransition src={loaderData?.icon} size={16}/>
                    : <ExclamationCircleFill size={14} color="#ffffffad"/>}
                    <Typography size=".8rem" color="$tagColor" family="Nunito">
                        <TextTransition inline noOverflow>
                            {`${Util.getLoaderName(config?.loader?.type)} ${config?.loader?.game}${config?.loader?.version ? `-${config.loader.version}` : ''}`}
                        </TextTransition>
                    </Typography>
                </Tag>
            </Grid>
            {instance.launchLogs &&
                <Grid width="auto" height={consoleOpen ? '-webkit-fill-available' : 'auto'} margin="0 1rem 1rem" direction="vertical" background="$secondaryBackground2" borderRadius={8} css={{
                    overflow: 'hidden',
                    position: 'relative',
                    maxHeight: '40%',
                    flexShrink: 0
                }}>
                    <Grid padding="14px 10px" css={{
                        borderBottom: consoleOpen ? '1px solid $secondaryBorder2' : null
                    }}>
                        <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                            Instance Console {logErrors.length && `(${logErrors.length} Errors!)`}
                        </Typography>
                    </Grid>
                    <Button theme="secondary" onClick={() => setConsoleOpen(!consoleOpen)} css={{
                        top: 8,
                        right: 8,
                        position: 'absolute'
                    }}>
                        {consoleOpen ? 'Hide' : 'Show'} Console
                    </Button>
                    {consoleOpen && <Grid width="100%" direction="vertical" css={{
                        overflow: 'auto'
                    }}>
                        {instance.launchLogs.map(({ text, type, thread, timestamp }, key) => {
                            const date = new Date(parseInt(timestamp));
                            return <Grid key={key} padding="4px 8px" spacing={8}>
                                <Grid spacing={2} direction="vertical">
                                    <Typography size=".8rem" color="$secondaryColor" family="Nunito" textalign="start" lineheight={1}>
                                        [{thread ?? 'main'}/{type}]
                                    </Typography>
                                    <Typography size=".8rem" color="$secondaryColor" family="Nunito" textalign="start" lineheight={1}>
                                        {date.toLocaleTimeString()}
                                    </Typography>
                                </Grid>
                                <Typography color={{
                                    ERROR: '#d39a9a'
                                }[type] ?? '$primaryColor'} family="Nunito" textalign="start" lineheight={1} css={{
                                    height: 'fit-content'
                                }}>
                                    {text}
                                </Typography>
                            </Grid>
                        })}
                    </Grid>}
                </Grid>
            }
            {!Account &&
                <InstanceInfo animate css={{ alignItems: 'start' }}>
                    <ExclamationCircleFill size={24} color="var(--colors-primaryColor)"/>
                    <Grid spacing={4} direction="vertical">
                        <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                            Account Required
                        </Typography>
                        <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={1.2}>
                            You don't have a Minecraft Account selected.<br/>
                            Add a Minecraft Account or choose one in Settings.
                        </Typography>
                    </Grid>
                </InstanceInfo>
            }
            {versionBanner && !instance.launchLogs &&
                <InstanceInfo css={{ justifyContent: 'space-between' }}>
                    <Grid spacing=".8rem">
                        <ImageTransition src={versionBanner[1]} size={48} width="8rem" css={{ imageRendering: '-webkit-optimize-contrast', backgroundPosition: 'left' }}/>
                        <Grid spacing={4} direction="vertical" justifyContent="center">
                            <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                                <TextTransition inline>{versionBanner[2]}</TextTransition>
                            </Typography>
                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                <TextTransition inline>
                                    {`${Util.getLoaderName(config?.loader?.type)} ${config?.loader?.game}`}
                                </TextTransition>
                            </Typography>
                        </Grid>
                    </Grid>
                    <ImageTransition src={loaderData?.creatorIcon ?? 'img/icons/no_author.svg'} size={40} width="8rem" css={{ backgroundPosition: 'right' }}/>
                </InstanceInfo>
            }
            {config.modpack.source !== "manual" &&
                <InstanceInfo css={{ alignItems: 'start' }}>
                    {modpack ? <React.Fragment>
                        <Image src={modpack.attachments.find(a => a.isDefault)?.url} size={48} borderRadius={8} css={{
                            transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    
                            '&:hover': {
                                zIndex: 2,
                                transform: 'scale(3) translate(32.5%, 32.5%)'
                            }
                        }}/>
                        <Button theme="secondary" onClick={viewModpackSite} style={{
                            top: 12,
                            right: 12,
                            position: 'absolute'
                        }}>
                            View Website
                        </Button>
                        <Grid margin="4px 0 0" spacing={4} direction="vertical" justifyContent="center">
                            <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                                {modpack.name}
                            </Typography>
                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                Downloaded from {Util.getPlatformName(config.modpack.source)}
                            </Typography>
                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" margin="4px 0 0" lineheight={1}>
                                {modpack.summary}
                            </Typography>
                        </Grid>
                    </React.Fragment> : <Spinner/>}
                </InstanceInfo>
            }
            {launchable === false &&
                <InstanceInfo animate css={{ alignItems: 'start' }}>
                    <ExclamationCircleFill size={24} color="var(--colors-primaryColor)"/>
                    <Grid spacing={4} direction="vertical">
                        <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                            Instance may not launch!
                        </Typography>
                        <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={1.2}>
                            '{config.loader.type}' is an unknown loader, and does not have any version files.<br/>
                            Under normal circumstances, this instance will fail to launch.
                        </Typography>
                    </Grid>
                    <Button theme="secondary" onClick={() => setLaunchable()} css={{ right: 16, position: 'absolute' }}>
                        Check Again
                    </Button>
                </InstanceInfo>
            }
            {!loaderData &&
                <InstanceInfo animate css={{ alignItems: 'start' }}>
                    <ExclamationCircleFill size={24} color="var(--colors-primaryColor)"/>
                    <Grid spacing={4} direction="vertical">
                        <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                            Unknown Loader
                        </Typography>
                        <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={1.2}>
                            '{config.loader.type}' is an unknown and unsupported loader, and comes from an unknown source.<br/>
                            Be cautious when using unknown/unsupported loaders, anything can happen!
                        </Typography>
                    </Grid>
                </InstanceInfo>
            }
            {loaderDisabled &&
                <InstanceInfo animate css={{ alignItems: 'start' }}>
                    <ExclamationCircleFill size={24} color="var(--colors-primaryColor)"/>
                    <Grid spacing={4} direction="vertical">
                        <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                            {Util.getLoaderName(config?.loader?.type)} is unavailable
                        </Typography>
                        <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={1.2}>
                            This loader may have some issues and has been temporarily disabled.<br/>
                            Make sure to check for new mdpkm updates!
                        </Typography>
                    </Grid>
                </InstanceInfo>
            }
            {!consoleOpen && <Tabs
                value={tabPage}
                onChange={event => setTabPage(event.target.value)}
                css={{
                    width: 'auto',
                    height: '-webkit-fill-available',
                    margin: '0 1rem 1rem'
                }}
            >
                <TabItem name={t('app.mdpkm.instance_page.tabs.mods')} value={0} padding={0} disabled={!instance.isModded}>
                    <Tabs
                        value={modPage}
                        onChange={event => setModPage(event.target.value)}
                        borderRadius={0}
                        css={{
                            height: '100%'
                        }}
                    >
                        <TabItem name={t('app.mdpkm.instance_page.tabs.mods.tabs.manage')} value={0}>
                            <Grid margin="4px 0" spacing={8} justifyContent="space-between">
                                <Grid direction="vertical">
                                    <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                        {t('app.mdpkm.mod_management.title')}
                                    </Typography>
                                    <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito">
                                        <TextTransition inline>
                                            {mods === 'loading' || !mods ? 'Loading...' : `${mods?.length} Installed ${mods?.length === 69 ? '(nice)' : ''}`}
                                        </TextTransition>
                                    </Typography>
                                </Grid>
                                <Grid spacing={8}>
                                    <TextInput
                                        width={144}
                                        value={modFilter}
                                        onChange={setModFilter}
                                        placeholder={t('app.mdpkm.mod_management.search')}
                                    />
                                    <Button theme="secondary" onClick={refreshMods} disabled={mods === 'loading'}>
                                        {mods === 'loading' ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                                        {t('app.mdpkm.common:actions.refresh')}
                                    </Button>
                                    <Button theme="accent" disabled>
                                        <CloudArrowDown size={14}/>
                                        {t('app.mdpkm.mod_management.get_updates')}
                                    </Button>
                                </Grid>
                            </Grid>
                            {Array.isArray(mods) ? mods.length === 0 ?
                                <React.Fragment>
                                    <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                                        There's nothing here!
                                    </Typography>
                                    <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={0} css={{ display: 'block' }}>
                                        Find some mods via the <b>Mod Search</b> tab!
                                    </Typography>
                                </React.Fragment>
                            : mods.filter(({ id, name }) => id?.toLowerCase().includes(modFilter) || name?.toLowerCase().includes(modFilter)).sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id)).map((mod, index) =>
                                <InstanceMod key={index} mod={mod} instanceId={id}/>
                            ) : <Spinner/>}
                        </TabItem>
                        <TabItem name={t('app.mdpkm.instance_page.tabs.mods.tabs.search')} value={1}>
                            <ModSearch instanceId={id}/>
                        </TabItem>
                    </Tabs>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.servers')} value={1}>
                    <Grid margin="4px 0" spacing={8} justifyContent="space-between">
                        <Grid direction="vertical">
                            <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                {t('app.mdpkm.server_management.title')}
                            </Typography>
                            <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito">
                                <TextTransition inline>
                                    {servers === 'loading' || !servers ? 'Loading...' :`${servers?.length} Servers`}
                                </TextTransition>
                            </Typography>
                        </Grid>
                        <Grid spacing={8}>
                            <TextInput
                                width={144}
                                value={serverFilter}
                                onChange={setServerFilter}
                                placeholder={t('app.mdpkm.server_management.search')}
                            />
                            <Button theme="secondary" onClick={getServers} disabled={servers === 'loading'}>
                                {servers === 'loading' ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                                {t('app.mdpkm.common:actions.refresh')}
                            </Button>
                            <Button theme="accent" disabled>
                                <PlusLg/>
                                {t('app.mdpkm.server_management.add')}
                            </Button>
                        </Grid>
                    </Grid>
                    {Array.isArray(servers) && servers?.filter(({ ip, name }) => ip?.value.toLowerCase().includes(serverFilter) || name?.value.toLowerCase().includes(serverFilter)).map((server, index) =>
                        <Grid key={index} padding="8px" spacing="12px" alignItems="center" background="$secondaryBackground2" borderRadius={8} css={{
                            position: 'relative'
                        }}>
                            <Image
                                src={server.icon ? `data:image/png;base64,${server.icon.value}` : 'img/icons/minecraft/unknown_server.png'}
                                size={46}
                                background="$secondaryBackground"
                                borderRadius={4}
                                css={{
                                    minWidth: 46,
                                    minHeight: 46,
                                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                                    '&:hover': {
                                        minWidth: 64,
                                        minHeight: 64
                                    }
                                }}
                            />
                            <Grid spacing={4} direction="vertical">
                                <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                    {server.name?.value}
                                    {server.acceptTextures?.value === 1 &&
                                        <Typography size=".7rem" color="$secondaryColor" weight={300} family="Nunito" margin="4px 0 0 8px" lineheight={1}>
                                            Server Resource Pack Accepted
                                        </Typography>
                                    }
                                </Typography>
                                <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                    {server.ip?.value}
                                </Typography>
                            </Grid>
                            <Grid spacing="8px" css={{
                                right: 16,
                                position: 'absolute'
                            }}>
                                <Button theme="secondary" disabled>
                                    <PencilFill/>
                                    {t('app.mdpkm.common:actions.edit')}
                                </Button>
                                <Button theme="secondary" disabled>
                                    <Trash3Fill/>
                                    {t('app.mdpkm.common:actions.delete')}
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.resource_packs')} value={2}>
                    <Grid margin="4px 0" spacing={8} justifyContent="space-between">
                        <Grid direction="vertical">
                            <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                {t('app.mdpkm.resourcepack_management.title')}
                            </Typography>
                            <Typography size=".7rem" color="$secondaryColor" weight={400} family="Nunito">
                                <TextTransition inline>
                                    {resourcePacks === 'loading' ? 'Loading...' :`${resourcePacks?.length} Resource Packs`}
                                </TextTransition>
                            </Typography>
                        </Grid>
                        <Grid spacing={8}>
                            <Button theme="secondary" onClick={getResourcePacks} disabled={resourcePacks === 'loading'}>
                                {resourcePacks === 'loading' ? <BasicSpinner size={16}/> : <ArrowClockwise size={14}/>}
                                {t('app.mdpkm.common:actions.refresh')}
                            </Button>
                            <Button theme="accent" disabled>
                                <PlusLg/>
                                {t('app.mdpkm.resourcepack_management.add')}
                            </Button>
                        </Grid>
                    </Grid>
                    {Array.isArray(resourcePacks) && resourcePacks?.filter(({ name }) => name.toLowerCase().includes(serverFilter)).map((resourcePack, index) =>
                        <Grid key={index} padding="8px" spacing="12px" alignItems="center" background="$secondaryBackground2" borderRadius={8} css={{
                            position: 'relative'
                        }}>
                            <Image
                                src={resourcePack.icon ? `data:image/png;base64,${resourcePack.icon}` : 'img/icons/minecraft/unknown_pack.png'}
                                size={46}
                                background="$secondaryBackground"
                                borderRadius={4}
                                css={{
                                    minWidth: 46,
                                    minHeight: 46,
                                    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                                    '&:hover': {
                                        minWidth: 64,
                                        minHeight: 64
                                    }
                                }}
                            />
                            <Grid spacing={4} direction="vertical">
                                <Typography size=".9rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                    {resourcePack.name}
                                    {resourcePack.acceptTextures?.value === 1 &&
                                        <Typography size=".7rem" color="$secondaryColor" weight={300} family="Nunito" margin="4px 0 0 8px" lineheight={1}>
                                            Server Resource Pack Accepted
                                        </Typography>
                                    }
                                </Typography>
                                <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                    {resourcePack.metadata.pack?.description}
                                </Typography>
                            </Grid>
                            <Grid spacing={8} css={{
                                right: 16,
                                position: 'absolute'
                            }}>
                                <Button theme="secondary" disabled>
                                    <Trash3Fill/>
                                    {t('app.mdpkm.common:actions.delete')}
                                </Button>
                            </Grid>
                        </Grid>
                    )}
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.essential')} value={3} spacing={6} disabled={!instance.isModded}>
                    <Image src="img/banners/essential_mod.svg" width="100%" height="1.2rem" margin="8px 0 0" css={{
                        backgroundPosition: "left center"
                    }}/>
                    <Typography size=".8rem" color="$secondaryColor" margin="0 0 8px" weight={600} family="Nunito" textalign="start">
                        The essential multiplayer mod for Minecraft Java.<br/>
                        mdpkm is not endorsed by Essential.
                    </Typography>
                    <Mod id="essential-container" api="internal" featured instanceId={id}/>
                </TabItem>
                <TabItem name="Game Loader" value={4}>
                    <Grid spacing={8}>
                        {loaderData?.icon ?
                            <Image src={loaderData?.icon} size={48} borderRadius={4}/>
                        : <Grid width={48} height={48} alignItems="center" background="$gray10" borderRadius={4} justifyContent="center">
                            <ExclamationCircleFill size={24} color="#ffffff80"/>
                        </Grid>}
                        <Grid height={48} spacing={4} direction="vertical" justifyContent="center">
                            <Typography size="1rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                {Util.getLoaderName(config?.loader?.type) ?? `${config.loader.type} (Unknown)`}
                                {LoaderStates[config.loader.type] &&
                                    <Tag margin="0 8px">
                                        <Typography size="0.7rem" color="$tagColor" weight={600} family="Nunito">
                                            {LoaderStates[config.loader.type]}
                                        </Typography>
                                    </Tag>
                                }
                            </Typography>
                            <Typography size=".7rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                                {config.loader.game}{config.loader.version && `-${config.loader.version}`}
                            </Typography>
                        </Grid>
                    </Grid>
                    {loaderData?.source?.recommendedMod &&
                        <Mod
                            id={loaderData.source.recommendedMod[0]}
                            api={loaderData.source.recommendedMod[1]}
                            instanceId={id}
                            recommended
                        />
                    }
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.settings')} value={5}>
                    <Grid justifyContent="space-between">
                        <Typography color="$primaryColor" family="Nunito">
                            Instance Settings
                        </Typography>
                        <Button theme="accent" onClick={saveSettings} disabled={saving}>
                            {saving ? <BasicSpinner size={16}/> : <PencilFill/>}
                            Save Changes
                        </Button>
                    </Grid>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" text="Instance Name" color="$secondaryColor" family="Nunito"/>
                        <TextInput value={instanceName} onChange={setInstanceName}/>
                    </Grid>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                            Memory Allocation - {instanceRam.toLocaleString('en', { minimumFractionDigits: 1 })}GB
                        </Typography>
                        <Slider
                            min={1}
                            max={Math.floor((totalMemory / 1000000) / 1.4)}
                            step={.5}
                            value={[instanceRam]}
                            onChange={setInstanceRam}
                        />
                    </Grid>
                    <Grid width="fit-content" spacing={4} direction="vertical">
                        <Typography size=".9rem" text="Delete Instance" color="$secondaryColor" family="Nunito"/>
                        <Dialog.Root>
                            <Dialog.Trigger asChild>
                                <Button theme="secondary" disabled={saving}>
                                    <Trash3Fill/>
                                    {t('app.mdpkm.common:actions.delete')}
                                </Button>
                            </Dialog.Trigger>
                            <Dialog.Content>
                                <Dialog.Title>Are you absolutely sure?</Dialog.Title>
                                <Dialog.Description>
                                    This action cannot be undone.<br/>
                                    '{instance.name}' will be lost forever! (A long time!)
                                </Dialog.Description>
                                <Grid margin="25 0 0" justifyContent="end">
                                    <Dialog.Close asChild>
                                        <Button theme="accent" onClick={deleteInstance}>
                                            Yes, delete Instance
                                        </Button>
                                    </Dialog.Close>
                                </Grid>
                            </Dialog.Content>
                        </Dialog.Root>
                    </Grid>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.export')} value={6}>
                    <Grid width="fit-content" spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                            {t('app.mdpkm.export_instance.title')}
                        </Typography>
                        <Grid spacing={8}>
                            <Button theme="accent" onClick={exportInstance}>
                                <Save2/>
                                {t('app.mdpkm.export_instance.buttons.export_mdpki')}
                            </Button>
                            <Button theme="secondary" disabled>
                                <Image src="img/icons/modrinth-white.svg" size={14}/>
                                {t('app.mdpkm.export_instance.buttons.export_modrinth')}
                            </Button>
                            <Button theme="secondary" disabled>
                                <FileEarmarkZip/>
                                {t('app.mdpkm.export_instance.buttons.export_curseforge')}
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid direction="vertical" background="$secondaryBackground2" borderRadius={8} css={{ overflow: 'hidden auto' }}>
                        <Grid alignItems="center" justifyContent="space-between">
                            <Typography size=".9rem" color="$secondaryColor" margin="8px 12px" family="Nunito">
                                {t('app.mdpkm.export_instance.files.title')}
                            </Typography>
                            <Button theme="secondary" onClick={getExportFiles}>
                                <ArrowClockwise size={14}/>
                                {t('app.mdpkm.common:actions.refresh')}
                            </Button>
                        </Grid>
                        <Divider width="100%" css={{ minHeight: 1 }}/>
                        {exportFiles && exportFiles.filter(({ path }) => path.replace(/\/+|\\+/g, '/').replace(instance.path.replace(/\/+|\\+/g, '/'), '').match(/\/+|\\+/g)?.length === 1)
                        .sort((a, b) => b.name.localeCompare(a.name))
                        .sort(({ isDir }, { isDir2 }) => isDir === isDir2 ? 0 : isDir ? -1 : 1)
                        .map(({ name, isDir, banned, selected, sensitive }, index) => {
                            const Icon = Object.entries({
                                '\\.txt$': FiletypeTxt,
                                '\\.png$': FiletypePng,
                                '\\.jpg$': FiletypeJpg,
                                '\\.svg$': FiletypeSvg,
                                '\\.json$': FiletypeJson,
                            }).find(([reg]) => new RegExp(reg).test(name))?.[1] ?? (isDir ? FolderFill : FileText);
                            return <React.Fragment key={index}>
                                <Grid spacing={8} padding="4px 8px" alignItems="center">
                                    <Toggle size="small" value={selected} disabled={banned} onChange={event => {
                                        exportFiles.find(f => f.name === name).selected = event.target.value;
                                        if(isDir)
                                            for (const file of exportFiles)
                                                if(!file.banned && file.path.replace(/\/+|\\+/g, '/').replace(instance.path.replace(/\/+|\\+/g, '/'), '').startsWith(`/${name}/`))
                                                    file.selected = event.target.value;
                                        setExportFiles(exportFiles);
                                    }}/>
                                    <Icon color={banned ? "var(--colors-secondaryColor)" : "var(--colors-primaryColor)"}/>
                                    <Typography color={banned ? "$secondaryColor" : "$primaryColor"} family="Nunito">
                                        {name}
                                        {banned && <Typography size=".7rem" color="$secondaryColor" weight={400} margin="0 0 0 8px" family="Nunito" lineheight={1}>
                                            {t('app.mdpkm.export_instance.files.banned')}
                                        </Typography>}
                                        {sensitive && <Typography size=".7rem" color="$secondaryColor" weight={400} margin="0 0 0 8px" family="Nunito" lineheight={1}>
                                            {t('app.mdpkm.export_instance.files.sensitive')}
                                        </Typography>}
                                    </Typography>
                                </Grid>
                                {index < exportFiles.length - 1 && <Divider width="100%" css={{ minHeight: 1 }}/>}
                            </React.Fragment>;
                        })}
                    </Grid>
                </TabItem>
            </Tabs>}
        </Grid>
    );
};

const InstanceInfoAnimation = keyframes({
    from: {
        opacity: 0,
    },
    to: {
        opacity: 1
    }
});

function InstanceInfo({ animate, children, css }) {
    return <Grid margin="0 1rem 1rem" spacing=".8rem" padding="12px" alignItems="center" background="$secondaryBackground2" borderRadius="1rem" css={{
        position: 'relative',
        animation: animate ? `${InstanceInfoAnimation} .5s cubic-bezier(0.4, 0, 0.2, 1)` : null,
        ...css
    }}>
        {children}
    </Grid>;
}