import { open } from '@tauri-apps/api/shell';
import { keyframes } from '@stitches/react';
import { Breakpoint } from 'react-socks';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';

import Home from './home';
import Tabs from '/voxeliface/components/Tabs';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Loader from './loader';
import Button from '/voxeliface/components/Button';
import Slider from '/voxeliface/components/Input/Slider';
import Content from './content';
import Spinner from '/voxeliface/components/Spinner';
import TabItem from '/voxeliface/components/Tabs/Item';
import TextInput from '/voxeliface/components/Input/Text';
import JsonEditor from '../JsonEditor';
import Typography from '/voxeliface/components/Typography';
import InputLabel from '/voxeliface/components/Input/Label';
import * as Dialog from '/voxeliface/components/Dialog';
import InstanceIcon from '../InstanceIcon';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import InstanceExport from '../InstanceExport';
import ServerManagement from '../ServerManagement';

import Util from '../../../common/util';
import mdpkm from '../../../mdpkm';
import Patcher from '../../../plugins/patcher';
import { toast } from '../../../util';
import { INSTANCE_STATE_ICONS } from '../../../util/constants';
import { useInstance, useCurrentAccount } from '../../../voxura';

const totalMemory = await Util.getTotalMemory();
console.log(totalMemory);
export default Patcher.register(function InstancePage({ id }) {
    const { t } = useTranslation();
    const account = useCurrentAccount();
    const uiStyle = useSelector(state => state.settings.uiStyle);
    const instance = useInstance(id);
    const StateIcon = INSTANCE_STATE_ICONS[instance?.state];
    const defaultResolution = useSelector(state => state.settings['instances.defaultResolution'])

    const { name, path, config, modpack } = instance ?? {};
    const loaderId = config?.loader?.type;
    const loaderEntry = mdpkm.getLoaderEntry(loaderId);

    const initialState = {
        instanceRam: instance?.config?.ram ?? 2,
        instanceName: name,
        instanceResolution: instance?.config?.resolution ?? defaultResolution
    };
    const logErrors = instance?.launchLogs?.filter(({ type }) => type === 'ERROR');
    const [saving, setSaving] = useState(false);
    const [tabPage, setTabPage] = useState(0);
    const [advancedSettings, setAdvancedSettings] = useState(false);
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

        if (instanceName !== instance.name) {
            const originalPath = path.toString();
            const splitPath = path.split(/\/+|\\+/g);
            splitPath.reverse()[0] = instanceName;

            instance.name = instanceName;
            instance.path = splitPath.reverse().join('/');
            await Util.moveFolder(originalPath, instance.path);
        }

        instance.config.ram = instanceRam[0];
        instance.config.resolution = instanceResolution;
        await instance.saveConfig();

        setSaving(false);
    };
    const viewModpackSite = () => open(modpack.websiteUrl);
    const deleteInstance = () => {
        setInstanceName();
        instance.delete();
    };
    const launchInstance = () => {
        instance.launch().then(() => {
            toast('Client has launched', instance.name);
        }).catch(err => {
            console.error(err);
            toast('Unexpected error', 'Failed to launch client.');
        });
    };
    const saveGameLoaderChanges = async() => {
        setEditingLoader('saving');
        const config = await instance.getConfig();
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
            loaderEntry.source.getVersions?.().then(versions => {
                setGameVersions(Object.keys(versions));
                setLoaderVersions(versions);
            });
        }
    }, [editingLoader]);

    if(!instance)
        return;
    return (
        <Grid height="100%" direction="vertical" instanceId={id} css={{ flex: 1, overflow: 'hidden' }}>
            <Grid margin={16} padding={12} borderRadius={16} css={{
                border: 'transparent solid 1px',
                position: 'relative',
                background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box'
            }}>
                <InstanceIcon size={uiStyle === 'compact' ? 64 : 80} instance={instance} hideLoader props={{
                    css: {
                        background: '$primaryBackground'
                    }
                }}/>
                <Grid margin={uiStyle === 'compact' ? '0 0 0 1rem' : '0 0 0 1.2rem'} spacing={uiStyle === 'compact' ? 4 : 6} direction="vertical" justifyContent="center">
                    <Typography size={uiStyle === 'compact' ? 20 : '1.3rem'} weight={600} lineheight={1}>
                        {name}
                    </Typography>
                    <Typography size={uiStyle === 'compact' ? 14 : 16} color="$secondaryColor" weight={400} spacing={6} horizontal lineheight={1}>
                        <StateIcon fontSize={12}/>
                        {t(`app.mdpkm.instances:state.${instance.state}`)}
                    </Typography>
                </Grid>
                <Grid spacing={8} alignItems="center" css={{
                    right: 12,
                    bottom: 12,
                    position: 'absolute'
                }}>
                    <Button theme="secondary" onClick={openFolder}>
                        <IconBiFolder2Open/>
                        <Breakpoint customQuery="(min-width: 850px)">
                            {t('app.mdpkm.common:actions.open_folder')}
                        </Breakpoint>
                    </Button>
                    <Button onClick={launchInstance} disabled={instance.isLaunching || instance.isRunning || !account}>
                        {instance.isLaunching ? <BasicSpinner size={16}/> : <IconBiPlayFill/>}
                        <Breakpoint customQuery="(min-width: 700px)">
                            {t('app.mdpkm.common:actions.launch')}
                        </Breakpoint>
                    </Button>
                </Grid>
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
                        <Typography lineheight={1}>
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
                                    <Typography size=".8rem" color="$secondaryColor" textalign="start" lineheight={1}>
                                        [{thread ?? 'main'}/{type}]
                                    </Typography>
                                    <Typography size=".8rem" color="$secondaryColor" textalign="start" lineheight={1}>
                                        {date.toLocaleTimeString()}
                                    </Typography>
                                </Grid>
                                <Typography color={{
                                    ERROR: '#d39a9a'
                                }[type] ?? '$primaryColor'} textalign="start" lineheight={1} css={{
                                    height: 'fit-content'
                                }}>
                                    {text}
                                </Typography>
                            </Grid>
                        })}
                    </Grid>}
                </Grid>
            }
            {!account &&
                <InstanceInfo animate>
                    <Typography>
                        <IconBiExclamationCircle/>
                    </Typography>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" lineheight={1}>
                            No Minecraft Account selected
                        </Typography>
                        <Typography size=".8rem" color="$secondaryColor" weight={400} textalign="start" lineheight={1.2} css={{display:'block'}}>
                            Add a new account or choose one in <b>Accounts</b>.
                        </Typography>
                    </Grid>
                </InstanceInfo>
            }
            {(config?.modpack?.source && config.modpack.source !== "manual") &&
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
                            <Typography lineheight={1}>
                                {modpack.name}
                            </Typography>
                            <Typography size=".8rem" color="$secondaryColor" weight={400} lineheight={1}>
                                Downloaded from {Util.getPlatformName(config.modpack.source)}
                            </Typography>
                            <Typography size=".8rem" color="$secondaryColor" weight={400} margin="4px 0 0" lineheight={1}>
                                {modpack.summary}
                            </Typography>
                        </Grid>
                    </React.Fragment> : <Spinner/>}
                </InstanceInfo>
            }
            {!consoleOpen && <Tabs
                value={tabPage}
                onChange={event => setTabPage(event.target.value)}
                css={{
                    width: 'auto',
                    margin: '0 1rem 0',
                    height: '-webkit-fill-available',
                    borderBottom: 'none',
                    borderRadius: '8px 8px 0 0'
                }}
            >
                <TabItem name={t('app.mdpkm.instance_page.tabs.home')} icon={<IconBiHouse/>} value={0}>
                    <Home setTab={setTabPage} instance={instance}/>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.content')} icon={<IconBiBox2/>} value={1} padding={0}>
                    <Content instance={instance}/>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.servers')} icon={<IconBiList/>} value={2}>
                    <ServerManagement instanceId={id}/>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.loader')} icon={<IconBiApp/>} value={3}>
                    <Loader instance={instance}/>
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.settings')} icon={<IconBiGear size={14}/>} value={4}>
                    {advancedSettings ?
                        <JsonEditor value={instance.store.data}/>
                    : <React.Fragment>
                        <Grid spacing={8} padding="4px 0" justifyContent="space-between">
                            <Grid direction="vertical">
                                <Typography size=".9rem" lineheight={1}>
                                    {t('app.mdpkm.instance_page.tabs.settings.title')}
                                </Typography>
                                <Typography size=".7rem" color="$secondaryColor" weight={400}>
                                    {name}
                                </Typography>
                            </Grid>
                            <Grid spacing={8}>
                                <Button theme="accent" onClick={saveSettings} disabled={saving}>
                                    {saving ? <BasicSpinner size={16}/> : <IconBiPencilFill style={{fontSize: 11}}/>}
                                    {t('app.mdpkm.common:actions.save_changes')}
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid direction="vertical">
                            <InputLabel>
                                {t('app.mdpkm.instance_page.tabs.settings.instance_name')}
                            </InputLabel>
                            <TextInput value={instanceName} onChange={setInstanceName}/>

                            <InputLabel spaciouser>
                                {t('app.mdpkm.instance_page.tabs.settings.memory_alloc', {
                                    val: instanceRam.toLocaleString('en', { minimumFractionDigits: 1 })
                                })}
                            </InputLabel>
                            <Slider
                                min={.5}
                                max={Math.floor((totalMemory / 1000000000) / 1.4)}
                                step={.5}
                                value={[instanceRam]}
                                onChange={setInstanceRam}
                            />

                            <InputLabel spaciouser>
                                {t('app.mdpkm.instance_page.tabs.settings.resolution')}
                            </InputLabel>
                            <Grid spacing={8}>
                                <Grid direction="vertical">
                                    <Typography size=".8rem" color="$secondaryColor">
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
                                    <Typography size=".8rem" color="$secondaryColor">
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
                            
                            <InputLabel spaciouser>
                                {t('app.mdpkm.instance_page.tabs.settings.delete')}
                            </InputLabel>
                            <Dialog.Root>
                                <Dialog.Trigger asChild>
                                    <Button theme="secondary" disabled={saving}>
                                        <IconBiTrash3Fill style={{fontSize: 11}}/>
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

                            <Typography size={14} color="$linkColor" margin="32px 0 0" onClick={() => setAdvancedSettings(true)} css={{
                                cursor: 'pointer'
                            }}>
                                Advanced Settings...
                            </Typography>
                        </Grid>
                    </React.Fragment>}
                </TabItem>
                <TabItem name={t('app.mdpkm.instance_page.tabs.export')} icon={<IconBiFileEarmarkZip size={14}/>} value={5}>
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
    return <Grid margin="0 1rem 1rem" spacing={16} padding="16px 24px" alignItems="center" background="$secondaryBackground2" borderRadius="1rem" css={{
        position: 'relative',
        animation: animate ? `${InstanceInfoAnimation} .5s cubic-bezier(0.4, 0, 0.2, 1)` : null,
        ...css
    }}>
        {children}
    </Grid>;
};