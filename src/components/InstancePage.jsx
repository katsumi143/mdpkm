import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { open } from '@tauri-apps/api/shell';
import { keyframes } from '@stitches/react';
import { Breakpoint } from 'react-socks';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { App, XLg, List, Gear, PlusLg, PlayFill, PencilFill, Trash3Fill, Folder2Open, FileEarmarkZip, ExclamationCircleFill } from 'react-bootstrap-icons';

import Mod from './Mod';
import Tag from './Tag';
import Tabs from '/voxeliface/components/Tabs';
import Grid from '/voxeliface/components/Grid';
import Modal from './Modal';
import Image from '/voxeliface/components/Image';
import Toggle from './Toggle';
import Button from '/voxeliface/components/Button';
import Slider from '/voxeliface/components/Input/Slider';
import * as Select from '/voxeliface/components/Input/Select';
import Spinner from '/voxeliface/components/Spinner';
import TabItem from '/voxeliface/components/Tabs/Item';
import TextInput from '/voxeliface/components/Input/Text';
import Typography from '/voxeliface/components/Typography';
import InputLabel from '/voxeliface/components/Input/Label';
import TextHeader from '/voxeliface/components/Typography/Header';
import BrowserLink from './BrowserLink';
import * as Dialog from '/voxeliface/components/Dialog';
import InstanceIcon from './InstanceIcon';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import ModManagement from './ModManagement';
import InstanceExport from './InstanceExport';
import TextTransition from './Transition/Text';
import ImageTransition from './Transition/Image';
import ServerManagement from './ServerManagement';
import ResourcePackManagement from './ResourcePackManagement';

import API from '../common/api';
import Util from '../common/util';
import Voxura from '../common/voxura';
import Patcher from '/src/common/plugins/patcher';
import Instances from '../common/instances';
import { useInstance } from '../common/voxura';
import { LoaderStates, DisabledLoaders } from '../common/constants';

const totalMemory = await Util.getTotalMemory();
export default Patcher.register(function InstancePage({ id }) {
    const { t } = useTranslation();
    const uiStyle = useSelector(state => state.settings.uiStyle);
    const instance = useInstance(id);
    const showBanner = useSelector(state => state.settings['instances.showBanner']);
    const defaultResolution = useSelector(state => state.settings['instances.defaultResolution'])

    const { name, path, config, modpack, minState } = instance ?? {};
    const loaderData = API.getLoader(config?.loader?.type);
    const versionBanner = (loaderData?.versionBanners ?? API.getLoader('java')?.versionBanners)?.find(v => v?.[0].test(config?.loader?.game));
    const loaderDisabled = DisabledLoaders.some(d => d === config?.loader?.type);

    const initialState = {
        instanceRam: instance?.config?.ram ?? 2,
        instanceName: name,
        instanceResolution: instance?.config?.resolution ?? defaultResolution
    };
    const Account = Util.getAccount(useSelector);
    const logErrors = instance?.launchLogs?.filter(({ type }) => type === 'ERROR');
    const [saving, setSaving] = useState(false);
    const [tabPage, setTabPage] = useState(0);
    const [launchable, setLaunchable] = useState();
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [gameVersion, setGameVersion] = useState(config?.loader?.game);
    const [instanceRam, setInstanceRam] = useState(initialState.instanceRam);
    const [gameVersions, setGameVersions] = useState();
    const [instanceName, setInstanceName] = useState(initialState.instanceName ?? '');
    const [editingLoader, setEditingLoader] = useState(false);
    const [loaderVersion, setLoaderVersion] = useState(config?.loader?.version);
    const [loaderVersions, setLoaderVersions] = useState();
    const [instanceResolution, setInstanceResolution] = useState(initialState.instanceResolution);
    const [downloadLoaderChanges, setDownloadLoaderChanges] = useState(true);
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
            ram: instanceRam[0],
            resolution: instanceResolution
        });
        Instance.updateStore();
        setSaving(false);
    };
    const viewModpackSite = () => open(modpack.websiteUrl);
    const deleteInstance = () => {
        setLaunchable();
        setInstanceName();
        Instances.getInstance(id).delete();
    };
    const launchInstance = async() => {
        /*const [verifiedAccount, changed] = await toast.promise(API.Minecraft.verifyAccount(Account), {
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
            toast.error(`getInstance failed.\nTry refreshing your instances.`);*/
        const Instance = Voxura.getInstance(id);
        Instance.launch();
    };
    const saveGameLoaderChanges = async() => {
        setEditingLoader('saving');
        const Instance = Instances.getInstance(id);
        const config = await Instance.getConfig();
        await Instance.saveConfig({
            ...config,
            loader: { ...config.loader, game: gameVersion, version: loaderVersion }
        });
        Instance.updateStore();
        setEditingLoader(false);

        if(downloadLoaderChanges && config.loader.game !== gameVersion) {
            const toastHead = 'Installing Minecraft';
            const toastId = toast.loading(`${toastHead}\n${t('app.mdpkm.instances:states.preparing')}`, {
                className: 'gotham',
                position: 'bottom-right',
                duration: 10000,
                style: { whiteSpace: 'pre-wrap' }
            });
            await Instances.installMinecraft(gameVersion, Instance, text => {
                Instance.setState(text);
                toast.loading(`${toastHead}\n${text}`, {
                    id: toastId
                });
            });
            toast.success(`Minecraft ${gameVersion} has been installed!`, {
                id: toastId,
                duration: 3000
            });
        }
        if(downloadLoaderChanges && config.loader.version !== loaderVersion) {
            const toastHead = `Installing ${t(`app.mdpkm.common:loaders.${config.loader.type}`)}`;
            const toastId = toast.loading(`${toastHead}\n${t('app.mdpkm.instances:states.preparing')}`, {
                className: 'gotham',
                position: 'bottom-right',
                duration: 10000,
                style: { whiteSpace: 'pre-wrap' }
            });
            await Instances.installLoader(Instance, toastId, toastHead, true);
            toast.success(`${t(`app.mdpkm.common:loaders.${config.loader.type}`)} ${loaderVersion} has been installed!`, {
                id: toastId,
                duration: 3000
            });
        }
        toast.success('Changes were applied successfully!', { duration: 5000 });
    };
    const openFolder = () => open(path);
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
        setLaunchable();
        setConsoleOpen(false);
        setGameVersion(config?.loader?.game);
        setInstanceRam(initialState.instanceRam);
        setInstanceName(initialState.instanceName);
        setLoaderVersion(config?.loader?.version);
        setInstanceResolution(initialState.instanceResolution);
    }, [id]);
    useEffect(() => {
        if(editingLoader && !gameVersions) {
            setGameVersions('loading');
            setLoaderVersions('loading');
            const loaderData = API.getLoader(config.loader.type);
            loaderData.source.getVersions?.().then(versions => {
                setGameVersions(Object.keys(versions));
                setLoaderVersions(versions);
            });
        }
    }, [editingLoader]);

    if(!instance)
        return;
    return (
        <Grid height="100%" direction="vertical" instanceId={id} css={{ flex: 1, overflow: 'hidden' }}>
            <Grid margin={16} padding={12} background="$secondaryBackground2" borderRadius={16} css={{
                position: 'relative'
            }}>
                <InstanceIcon size={uiStyle === 'compact' ? 64 : 80} instance={instance} hideLoader props={{
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
                <Grid margin={uiStyle === 'compact' ? '0 0 0 1rem' : '0 0 0 1.2rem'} spacing={uiStyle === 'compact' ? 4 : 6} direction="vertical" justifyContent="center">
                    <Typography size={uiStyle === 'compact' ? '1.2rem' : '1.3rem'} color="$primaryColor" weight={600} family="Nunito" lineheight={1}>
                        <TextTransition inline>{name}</TextTransition>
                    </Typography>
                    <Typography size={uiStyle === 'compact' ? '.9rem' : '1rem'} color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        <TextTransition inline noOverflow>
                            {minState ?? t('app.mdpkm.instances:states.none')}
                        </TextTransition>
                    </Typography>
                </Grid>
                <Grid spacing={8} alignItems="center" css={{
                    right: 12,
                    bottom: 12,
                    position: 'absolute'
                }}>
                    <Button theme="secondary" onClick={openFolder}>
                        <Folder2Open/>
                        <Breakpoint customQuery="(min-width: 850px)">
                            {t('app.mdpkm.common:actions.open_folder')}
                        </Breakpoint>
                    </Button>
                    <Button onClick={launchInstance} disabled={loaderDisabled || !!minState || !Account}>
                        {!!minState ? <BasicSpinner size={16}/> : <PlayFill/>}
                        <Breakpoint customQuery="(min-width: 700px)">
                            {t('app.mdpkm.common:actions.launch')}
                        </Breakpoint>
                    </Button>
                </Grid>
                <Breakpoint customQuery="(min-width: 700px)">
                    <Tag css={{
                        right: 12,
                        position: 'absolute'
                    }}>
                        {loaderData?.icon ?
                            <ImageTransition src={loaderData?.icon} size={16}/>
                        : <ExclamationCircleFill size={14} color="#ffffffad"/>}
                        <Typography size=".8rem" color="$tagColor" family="Nunito" spacing={4} horizontal>
                            <TextTransition inline noOverflow>
                                {Util.getLoaderName(config?.loader?.type)}
                            </TextTransition>
                            <Breakpoint customQuery="(min-width: 850px)">
                                <TextTransition inline noOverflow>
                                    {config?.loader.game}{config?.loader?.version ? `-${config.loader.version}` : ''}
                                </TextTransition>
                            </Breakpoint>
                        </Typography>
                    </Tag>
                </Breakpoint>
            </Grid>
            {instance.launchLogs &&
                <Grid width="auto" height={consoleOpen ? '70%' : 'auto'} margin="0 8px 8px" direction="vertical" background="$secondaryBackground2" borderRadius={8} css={{
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0
                }}>
                    <Grid padding="14px 10px" css={{
                        borderBottom: consoleOpen ? '1px solid $secondaryBorder2' : null
                    }}>
                        <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                            Instance Console {logErrors.length ? `(${logErrors.length} Errors!)` : ''}
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
                            Add a Minecraft Account or choose one in Settings.<br/>
                            <span>
                                Need some help? Read the <BrowserLink href="https://docs.mdpkm.voxelified.com/docs/tutorials/account-login">
                                    guide
                                </BrowserLink>!
                            </span>
                        </Typography>
                    </Grid>
                </InstanceInfo>
            }
            {Account && versionBanner && !instance.launchLogs && showBanner &&
                <InstanceInfo css={{ justifyContent: 'space-between' }}>
                    <Grid spacing={uiStyle === 'compact' ? '.3rem' : '.8rem'}>
                        <ImageTransition
                            src={versionBanner[1]}
                            size={uiStyle === 'compact' ? 32 : 48}
                            width="8rem"
                            css={{
                                imageRendering: '-webkit-optimize-contrast',
                                backgroundPosition: 'left'
                            }}
                        />
                        <Grid spacing={4} direction="vertical" justifyContent="center">
                            <Typography size={uiStyle === 'compact' ? '.9rem' : '1rem'} color="$primaryColor" family="Nunito" lineheight={1}>
                                <TextTransition inline>{versionBanner[2]}</TextTransition>
                            </Typography>
                            <Typography size={uiStyle === 'compact' ? '.7rem' : '.8rem'} color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                <TextTransition inline>
                                    {`${Util.getLoaderName(config?.loader?.type)} ${config?.loader?.game}`}
                                </TextTransition>
                            </Typography>
                        </Grid>
                    </Grid>
                    <ImageTransition
                        src={loaderData?.creatorIcon ?? 'img/icons/no_author.svg'}
                        size={uiStyle === 'compact' ? 32 : 40}
                        width="8rem"
                        css={{ backgroundPosition: 'right' }}
                    />
                </InstanceInfo>
            }
            {config?.modpack?.source !== "manual" &&
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
                            '{config?.loader.type}' is an unknown loader, and does not have any version files.<br/>
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
                            '{config?.loader.type}' is an unknown and unsupported loader, and comes from an unknown source.<br/>
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
                    margin: '0 1rem 1rem',
                    height: '-webkit-fill-available'
                }}
            >
                <TabItem name={t('app.mdpkm.instance_page.tabs.mods')} icon={<List size={14}/>} value={0} padding={0} disabled={!instance.isModded}>
                    <ModManagement instanceId={id}/>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.servers')} icon={<List size={14}/>} value={1}>
                    <ServerManagement instanceId={id}/>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.resource_packs')} icon={<List size={14}/>} value={2}>
                    <ResourcePackManagement instanceId={id}/>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.loader')} icon={<App size={14}/>} value={3}>
                    <Grid spacing={12} padding={8} alignItems="center" background="$secondaryBackground2" borderRadius={4} css={{
                        position: 'relative'
                    }}>
                        {loaderData?.icon ?
                            <Image src={loaderData?.icon} size={48} background="$secondaryBackground" borderRadius={4}/>
                        : <Grid width={48} height={48} alignItems="center" background="$gray10" borderRadius={4} justifyContent="center">
                            <ExclamationCircleFill size={24} color="#ffffff80"/>
                        </Grid>}
                        <Grid spacing={4} direction="vertical" justifyContent="center">
                            <Typography size="1rem" color="$primaryColor" family="Nunito" horizontal lineheight={1}>
                                {Util.getLoaderName(config?.loader?.type) ?? `${config?.loader.type} (Unknown)`}
                                {LoaderStates[config?.loader.type] &&
                                    <Tag margin="0 8px">
                                        <Typography size="0.7rem" color="$tagColor" weight={600} family="Nunito">
                                            {LoaderStates[config?.loader.type]}
                                        </Typography>
                                    </Tag>
                                }
                            </Typography>
                            <Typography size=".7rem" color="$secondaryColor" family="Nunito" lineheight={1}>
                                {config?.loader.game}{config?.loader.version && `-${config?.loader.version}`}
                            </Typography>
                        </Grid>
                        <Grid css={{
                            right: 16,
                            position: 'absolute'
                        }}>
                            <Button theme="accent" onClick={() => setEditingLoader(true)}>
                                <PencilFill/>
                                {t('app.mdpkm.common:actions.edit')}
                            </Button>
                        </Grid>
                        {editingLoader && <Modal width="40%">
                            <TextHeader>Editing Game Loader</TextHeader>
                            <Grid direction="vertical">
                                <InputLabel>Minecraft Version</InputLabel>
                                <Select.Root
                                    value={gameVersion}
                                    onChange={setGameVersion}
                                    disabled={gameVersions === 'loading'}
                                >
                                    <Select.Group name={t('app.mdpkm.loader_setup.game_version.category')}>
                                        {Array.isArray(gameVersions) && gameVersions.map((version, index) =>
                                            <Select.Item key={index} value={version}>
                                                {version}
                                            </Select.Item>
                                        )}
                                    </Select.Group>
                                </Select.Root>

                                {Instances.getInstance(id)?.isModded() && <React.Fragment>
                                    <InputLabel spacious>Loader Version</InputLabel>
                                    <Select.Root
                                        value={loaderVersion}
                                        onChange={setLoaderVersion}
                                        disabled={loaderVersions === 'loading'}
                                    >
                                        <Select.Group name={t('app.mdpkm.loader_setup.loader_version.category')}>
                                            {typeof loaderVersions === 'object' && loaderVersions[gameVersion].map((version, index) =>
                                                <Select.Item key={index} value={version}>
                                                    {version}
                                                </Select.Item>
                                            )}
                                        </Select.Group>
                                    </Select.Root>
                                </React.Fragment>}

                                <InputLabel spacious>Download after saving</InputLabel>
                                <Toggle size="small" value={downloadLoaderChanges} onChange={setDownloadLoaderChanges}/>

                                <Grid margin="2rem 0 0" spacing={8}>
                                    <Button theme="accent" onClick={saveGameLoaderChanges}>
                                        <PlusLg size={14}/>
                                        {t('app.mdpkm.common:actions.save_changes')}
                                    </Button>
                                    <Button theme="secondary" onClick={() => setEditingLoader(false)}>
                                        <XLg/>
                                        {t('app.mdpkm.common:actions.cancel')}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Modal>}
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
                <TabItem name={t('app.mdpkm.instance_page.tabs.settings')} icon={<Gear size={14}/>} value={4} padding={0}>
                    <Grid padding={8} justifyContent="space-between" css={{
                        borderBottom: '1px solid $secondaryBorder'
                    }}>
                        <Typography color="$primaryColor" family="Nunito">
                            {t('app.mdpkm.instance_page.tabs.settings.title')}
                        </Typography>
                        <Button theme="accent" onClick={saveSettings} disabled={saving}>
                            {saving ? <BasicSpinner size={16}/> : <PencilFill/>}
                            {t('app.mdpkm.common:actions.save_changes')}
                        </Button>
                    </Grid>
                    <Grid padding=".6rem .8rem" spacing={16} direction="vertical">
                        <Grid spacing={4} direction="vertical">
                            <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                                {t('app.mdpkm.instance_page.tabs.settings.instance_name')}
                            </Typography>
                            <TextInput value={instanceName} onChange={setInstanceName}/>
                        </Grid>
                        <Grid spacing={4} direction="vertical">
                            <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                                {t('app.mdpkm.instance_page.tabs.settings.memory_alloc', {
                                    val: instanceRam.toLocaleString('en', { minimumFractionDigits: 1 })
                                })}
                            </Typography>
                            <Slider
                                min={1}
                                max={Math.floor((totalMemory / 1000000) / 1.4)}
                                step={.5}
                                value={[instanceRam]}
                                onChange={setInstanceRam}
                            />
                        </Grid>
                        <Grid spacing={4} direction="vertical">
                            <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                                {t('app.mdpkm.instance_page.tabs.settings.resolution')}
                            </Typography>
                            <Grid spacing={8}>
                                <Grid direction="vertical">
                                    <Typography size=".8rem" color="$secondaryColor" family="Nunito">
                                        {t('app.mdpkm.instance_page.tabs.settings.resolution.width')}
                                    </Typography>
                                    <TextInput
                                        width={80}
                                        value={Math.max(0, instanceResolution[0] || 0)}
                                        onChange={value => {
                                            const number = parseInt(value);
                                            setInstanceResolution(val => [number, val[1]]);
                                        }}
                                    />
                                </Grid>
                                <Grid direction="vertical">
                                    <Typography size=".8rem" color="$secondaryColor" family="Nunito">
                                        {t('app.mdpkm.instance_page.tabs.settings.resolution.height')}
                                    </Typography>
                                    <TextInput
                                        width={80}
                                        value={Math.max(0, instanceResolution[1] || 0)}
                                        onChange={value => {
                                            const number = parseInt(value);
                                            setInstanceResolution(val => [val[0], number]);
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid width="fit-content" spacing={4} direction="vertical">
                            <Typography size=".9rem" color="$secondaryColor" family="Nunito">
                                {t('app.mdpkm.instance_page.tabs.settings.delete')}
                            </Typography>
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
                    </Grid>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.export')} icon={<FileEarmarkZip size={14}/>} value={5}>
                    <InstanceExport instanceId={id}/>
                </TabItem>
            </Tabs>}
        </Grid>
    );
});

const InstanceInfoAnimation = keyframes({
    from: {
        opacity: 0,
    },
    to: {
        opacity: 1
    }
});

function InstanceInfo({ animate, children, css }) {
    return <Grid margin="0 1rem 1rem" spacing=".8rem" padding={12} alignItems="center" background="$secondaryBackground2" borderRadius="1rem" css={{
        position: 'relative',
        animation: animate ? `${InstanceInfoAnimation} .5s cubic-bezier(0.4, 0, 0.2, 1)` : null,
        ...css
    }}>
        {children}
    </Grid>;
}