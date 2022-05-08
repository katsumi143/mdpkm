import React, { useEffect, useState } from 'react';
import nbt from 'nbt';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { keyframes } from '@stitches/react';
import { open } from '@tauri-apps/api/shell';
import { PlayFill, PencilFill, Trash3Fill, Folder2Open, FolderFill, FileTextFill, ExclamationCircleFill, FileEarmarkZip, Save2 } from 'react-bootstrap-icons';

import Mod from './Mod';
import Tag from './Tag';
import Tabs from '/voxeliface/components/Tabs';
import Grid from '/voxeliface/components/Grid';
import Image from '/voxeliface/components/Image';
import Toggle from './Toggle';
import Button from '/voxeliface/components/Button';
import * as Dialog from '/voxeliface/components/Dialog';
import Spinner from '/voxeliface/components/Spinner';
import Divider from '/voxeliface/components/Divider';
import TextInput from '/voxeliface/components/Input/Text';
import ModSearch from './ModSearch';
import Typography from '/voxeliface/components/Typography';
import InstanceMod from './InstanceMod';
import InstanceIcon from './InstanceIcon';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import TextTransition from './Transition/Text';
import ImageTransition from './Transition/Image';

import API from '../common/api';
import Util from '../common/util';
import Instances from '../common/instances';
import { saveAccounts, writeAccount } from '../common/slices/accounts';
import { LoaderData, LoaderNames, LoaderIcons, LoaderStates, PlatformNames, PlatformIndex, DisabledLoaders } from '../common/constants';

export default function InstancePage({ instance }) {
    const Instance = Instances.instances?.[instance];
    const { mods, name, path, state, config, modpack } = Instance ?? {};
    const loaderData = LoaderData[config?.loader.type];
    const versionBanner = (loaderData?.versionBanners ?? LoaderData.java.versionBanners).find(v => v?.[0].test(config.loader.game));
    const loaderDisabled = DisabledLoaders.some(d => d === config?.loader.type);

    const uuid = useSelector(state => state.accounts.selected);
    const Account = useSelector(state => state.accounts.data).find(a => a.profile.uuid === uuid);
    const dispatch = useDispatch();
    const logErrors = Instance.launchLogs?.filter(({ type }) => type === 'ERROR');
    const [servers, setServers] = useState();
    const [tabPage, setTabPage] = useState(0);
    const [modPage, setModPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [instance2, setInstance2] = useState();
    const [optionsMod, setOptionsMod] = useState();
    const [launchable, setLaunchable] = useState();
    const [exportFiles, setExportFiles] = useState();
    const [deleteValue, setDeleteValue] = useState();
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [instanceName, setInstanceName] = useState(name);
    const [essentialMod, setEssentialMod] = useState();
    const saveInstanceName = () => {
        setRenaming(true);
        const originalPath = path.toString();
        const splitPath = path.split(/\/+|\\+/g);
        splitPath.reverse()[0] = instanceName;

        Instance.name = instanceName;
        Instance.path = splitPath.reverse().join('/');
        Util.moveFolder(originalPath, path).then(() => setRenaming(false));
    };
    const viewModpackSite = () => open(modpack.websiteUrl);
    const exportInstance = () => Instances.exportInstance(Instance, exportFiles.filter(e => e.selected).map(e => e.path));
    const deleteInstance = () => Instance.delete();
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
        Instance.launch(verifiedAccount).catch(err => {
            console.error(err);
            toast.error(`Failed to launch ${Instance.name}!\n${err.message ?? 'Unknown Reason.'}`);

            Instance.setState();
        });
    }
    const getExportFiles = async() => {
        const files = await Util.readDirRecursive(Instance.path);
        setExportFiles(files.map(file => {
            file.banned = [
                'dashloader-cache',
                'modcache.json',
                'modpack.json',
                'config.json',
                '.ReAuth.cfg',
                '.mixin.out',
                'essential',
                'icon.png',
                '.fabric',
                'natives',
                'mods'
            ].some(name => file.name === name || file.path.replace(Instance.path, '').replace(/\/+|\\+/g, '/').startsWith(`/${name}/`));
            file.sensitive = [
                'crash-reports',
                'logs'
            ].indexOf(file.name) >= 0;
            file.selected = [
                'modpack.json',
                'config.json',
                'options.txt',
                'icon.png',
                'config',
                'mods'
            ].some(name => file.name === name || file.path.replace(/\/+|\\+/g, '/').replace(Instance.path.replace(/\/+|\\+/g, '/'), '').startsWith(`/${name}/`));
            return file;
        }));
    };
    const getServers = async() => {
        const path = `${Instance.path}/servers.dat`;
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
    if(!Instance)
        return null;

    useEffect(() => {
        if(!exportFiles)
            getExportFiles();
    }, [exportFiles]);
    useEffect(() => {
        if(!servers)
            getServers();
    }, [servers]);
    useEffect(() => {
        const loaderMods = {
            quilt: ['qsl', API.Modrinth],
            fabric: ['fabric-api', API.Modrinth]
        };
        if(!optionsMod && loaderMods[config.loader.type]) {
            const loaderMod = loaderMods[config.loader.type];
            if(loaderMod)
                loaderMod[1].getProject(loaderMod[0]).then(setOptionsMod);
        }
    }, [optionsMod]);
    useEffect(() => {
        if(!essentialMod)
            API.Internal.getProject('essential-container').then(setEssentialMod);
    }, [essentialMod]);
    useEffect(() => {
        if(typeof launchable !== 'boolean') {
            const loaderType = Util.getLoaderType(config.loader.type);
            if(loaderType === 'unknown')
                Util.fileExists(
                    `${Instances.getPath('versions')}/${config.loader.type}-${config.loader.game}-${config.loader.version}/manifest.json`
                ).then(setLaunchable);
            else
                setLaunchable(true);
        }
    }, [launchable]);
    useEffect(() => {
        if(instance2 !== instance) {
            setServers();
            setLaunchable();
            setOptionsMod();
            setExportFiles();
            setDeleteValue();
            setInstanceName(name);
        }
        setInstance2(instance);
    });

    return (
        <Grid width="-webkit-fill-available" margin="0 0 0 35%" height="100%" direction="vertical" css={{
            flex: 1
        }}>
            <Grid margin="1rem" padding="12px" background="$secondaryBackground2" borderRadius="1rem" css={{
                position: 'relative'
            }}>
                <InstanceIcon size={80} instance={Instance} hideLoader props={{
                    css: {
                        background: '$primaryBackground',
                        transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',

                        '&:hover': {
                            transform: 'scale(2) translate(25%, 25%)'
                        }
                    }
                }}/>
                <Grid margin="0 0 0 1.2rem" spacing="6px" direction="vertical" justifyContent="center">
                    <Typography size="1.3rem" color="$primaryColor" weight={600} family="Nunito" lineheight={1}>
                        <TextTransition inline>{name}</TextTransition>
                    </Typography>
                    <Typography color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                        <TextTransition inline noOverflow>{state ?? 'Installed'}</TextTransition>
                    </Typography>
                </Grid>
                <Grid spacing="8px" alignItems="center" css={{
                    right: 12,
                    bottom: 12,
                    position: 'absolute'
                }}>
                    <Button theme="secondary" onClick={openFolder}>
                        <Folder2Open/>
                        Open Folder
                    </Button>
                    <Button onClick={launchInstance} disabled={loaderDisabled || !!state || !Account}>
                        <PlayFill/>
                        Launch
                    </Button>
                </Grid>
                <Tag css={{
                    right: 12,
                    position: 'absolute'
                }}>
                    {LoaderIcons[config.loader.type] ?
                        <ImageTransition src={LoaderIcons[config.loader.type]} size={16}/>
                    : <ExclamationCircleFill size={14} color="#ffffffad"/>}
                    <Typography size=".8rem" color="$tagColor" family="Nunito">
                        <TextTransition inline noOverflow>
                            {`${LoaderNames[config.loader.type] ?? config.loader.type} ${config.loader.game}${config.loader.version ? `-${config.loader.version}` : ''}`}
                        </TextTransition>
                    </Typography>
                </Tag>
            </Grid>
            {Instance.launchLogs &&
                <Grid width="auto" height={consoleOpen ? '40%' : 'auto'} margin="0 1rem 1rem" direction="vertical" background="$secondaryBackground2" borderRadius={8} css={{
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
                        {Instance.launchLogs.map(({ text, type, thread, timestamp }, key) => {
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
                    <Grid spacing="4px" direction="vertical">
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
            {versionBanner && !Instance.launchLogs &&
                <InstanceInfo css={{ justifyContent: 'space-between' }}>
                    <Grid spacing=".8rem">
                        <ImageTransition src={versionBanner[1]} size={48} width="8rem" css={{ imageRendering: '-webkit-optimize-contrast', backgroundPosition: 'left' }}/>
                        <Grid spacing="4px" direction="vertical" justifyContent="center">
                            <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                                <TextTransition inline>{versionBanner[2]}</TextTransition>
                            </Typography>
                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                <TextTransition inline>
                                    {`${Util.getLoaderName(config.loader.type)} ${config.loader.game}`}
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
                        <Grid margin="4px 0 0" spacing="4px" direction="vertical" justifyContent="center">
                            <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                                {modpack.name}
                            </Typography>
                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" lineheight={1}>
                                Downloaded from {PlatformNames[PlatformIndex[config.modpack.source]] ?? config.modpack.source}
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
                    <Grid spacing="4px" direction="vertical">
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
            {Util.getLoaderType(config?.loader.type) === 'unknown' &&
                <InstanceInfo animate css={{ alignItems: 'start' }}>
                    <ExclamationCircleFill size={24} color="var(--colors-primaryColor)"/>
                    <Grid spacing="4px" direction="vertical">
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
                    <Grid spacing="4px" direction="vertical">
                        <Typography color="$primaryColor" family="Nunito" lineheight={1}>
                            {Util.getLoaderName(config?.loader.type)} is unavailable
                        </Typography>
                        <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={1.2}>
                            This loader may have some issues and has been temporarily disabled.<br/>
                            Make sure to check for new mdpkm updates!
                        </Typography>
                    </Grid>
                </InstanceInfo>
            }
            <Tabs 
                tabs={[
                    ["Modifications", 0, !Instance.isModded()],
                    [`Server List (${servers?.length ?? 0})`, 1, !Instance.isJava()],
                    ["Essential Mod", 2, config.loader.type !== "fabric" && config.loader.type !== "forge" && config.loader.type !== "quilt"],
                    ["Loader Options", 3],
                    ["Settings", 4],
                    ["Export", 5]
                ]}
                pages={[
                    [0, <React.Fragment>
                        <Tabs 
                            tabs={[
                                [`Manage Mods`, 0],
                                ["Mod Search", 1]
                            ]}
                            pages={[
                                [0, <Grid spacing={8} padding="1rem" direction="vertical">
                                    <Grid spacing={8} alignItems="center" justifyContent="space-between">
                                        <Typography color="$primaryColor" family="Nunito" css={{ gap: 8 }}>
                                            Mod Management
                                            <Typography size=".8rem" color="$secondaryColor" weight={400} family="Nunito">
                                                {mods?.length} Installed
                                            </Typography>
                                        </Typography>
                                        <Button theme="secondary" disabled>
                                            Check for Updates
                                        </Button>
                                    </Grid>
                                    {mods ? mods.length === 0 ? <React.Fragment>
                                        <Typography size="1.2rem" color="$primaryColor" family="Nunito Sans">
                                            There's nothing here!
                                        </Typography>
                                        <Typography size=".9rem" color="$secondaryColor" weight={400} family="Nunito" textalign="start" lineheight={0} css={{ display: 'block' }}>
                                            Find some mods via the <b>Mod Search</b> tab!
                                        </Typography>
                                    </React.Fragment> : mods.sort((a, b) => (a.name ?? a.id).localeCompare(b.name ?? b.id)).map((mod, index) =>
                                            <InstanceMod key={index} mod={mod} instance={instance}/>
                                        )
                                    : <Spinner/>}
                                </Grid>, true, true],
                                [1, <React.Fragment>
                                    <ModSearch instance={instance}/>
                                </React.Fragment>]
                            ]}
                            value={modPage}
                            onChange={event => setModPage(event.target.value)}
                            css={{
                                height: '100%'
                            }}
                        />
                    </React.Fragment>, true],
                    [1, <React.Fragment>
                        <Grid spacing="8px" direction="vertical">
                            <Grid spacing="8px">
                                <Button disabled>
                                    Add a Server
                                </Button>
                                <Button theme="secondary" onClick={getServers} disabled={loading}>
                                    {loading && <BasicSpinner size={16}/>}
                                    Refresh
                                </Button>
                            </Grid>
                            {servers?.map((server, index) =>
                                <Grid key={index} padding="8px" spacing="12px" alignItems="center" background="$secondaryBackground2" borderRadius={8} css={{
                                    position: 'relative'
                                }}>
                                    {server.icon ?
                                        <Image src={`data:image/png;base64,${server.icon.value}`} size={46} borderRadius={4}/>
                                    : <Grid width={46} height={46} alignItems="center" background="$secondaryBackground" borderRadius={4} justifyContent="center">
                                        <ExclamationCircleFill size={22} color="#ffffff80"/>
                                    </Grid>}
                                    <Grid spacing="4px" direction="vertical">
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
                                            Edit
                                        </Button>
                                        <Button theme="secondary" disabled>
                                            <Trash3Fill/>
                                            Delete
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                    </React.Fragment>],
                    [2, <Grid margin="1rem 0 .6rem 0.6rem" direction="vertical">
                        <Image src="essential-banner.svg" width="100%" height="1.2rem" css={{
                            backgroundPosition: "left center"
                        }}/>
                        <Typography size=".8rem" color="$secondaryColor" margin="4px 0 1rem" weight={600} family="Nunito" textalign="start">
                            The essential multiplayer mod for Minecraft Java.<br/>
                            mdpkm is not endorsed by Essential.
                        </Typography>
                        <Mod data={essentialMod} instance={instance} featured/>
                    </Grid>],
                    [3, <Grid direction="vertical">
                        <Grid margin="0 0 1rem" spacing="8px">
                            {LoaderIcons[config.loader.type] ?
                                <Image src={LoaderIcons[config.loader.type]} size={48} borderRadius={4}/>
                            : <Grid width={48} height={48} alignItems="center" background="$gray10" borderRadius={4} justifyContent="center">
                                <ExclamationCircleFill size={24} color="#ffffff80"/>
                            </Grid>}
                            <Grid height="48px" spacing="4px" direction="vertical" justifyContent="center">
                                <Typography size="1rem" color="$primaryColor" family="Nunito" lineheight={1}>
                                    {LoaderNames[config.loader.type] ?? `${config.loader.type} (Unknown)`}
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
                        {Instance.isModded() &&
                            <Mod data={optionsMod} instance={instance} recommended/>
                        }
                    </Grid>],
                    [4, <Grid spacing="1rem" direction="vertical">
                        <Grid spacing="4px" direction="vertical">
                            <Typography size=".9rem" text="Instance Name" color="$secondaryColor" family="Nunito"/>
                            <TextInput value={instanceName} onChange={event => setInstanceName(event.target.value)}>
                                <Button theme="secondary" onClick={saveInstanceName} disabled={renaming || instanceName === name}>
                                    <PencilFill/>
                                    Save Changes
                                </Button>
                            </TextInput>
                        </Grid>
                        <Grid width="fit-content" spacing="4px" direction="vertical">
                            <Typography size=".9rem" text="Delete Instance" color="$secondaryColor" family="Nunito"/>
                            <Dialog.Root>
                                <Dialog.Trigger asChild>
                                    <Button theme="secondary">
                                        <Trash3Fill/>
                                        Delete
                                    </Button>
                                </Dialog.Trigger>
                                <Dialog.Content>
                                    <Dialog.Title>Are you absolutely sure?</Dialog.Title>
                                    <Dialog.Description>
                                        This action cannot be undone.<br/>
                                        '{Instance.name}' will be lost forever! (A long time!)
                                    </Dialog.Description>
                                    <Grid margin="25 0 0" justifyContent="end">
                                        <Dialog.Close asChild>
                                            <Button size="medium" theme="alert" onClick={deleteInstance}>
                                                Yes, delete Instance
                                            </Button>
                                        </Dialog.Close>
                                    </Grid>
                                </Dialog.Content>
                            </Dialog.Root>
                        </Grid>
                        <Button onClick={_ => Tauri.path.resolve(path).then(Tauri.clipboard.writeText)}>
                            Copy Folder Path
                        </Button>
                    </Grid>],
                    [5, <React.Fragment>
                        <Grid width="fit-content" margin="0 0 1rem" spacing={4} direction="vertical">
                            <Typography size=".9rem" text="Export Instance" color="$secondaryColor" family="Nunito"/>
                            <Grid spacing="8px">
                                <Button onClick={exportInstance}>
                                    <Save2/>
                                    Export as .mdpki
                                </Button>
                                <Button theme="secondary" disabled>
                                    <FileEarmarkZip/>
                                    Export as ZIP (CurseForge)
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid direction="vertical" background="#00000040" borderRadius={8} css={{ overflow: 'hidden auto' }}>
                            <Typography size=".9rem" color="$secondaryColor" margin="8px 12px" family="Nunito">
                                Choose files to export
                            </Typography>
                            <Divider width="100%" css={{ minHeight: 1 }}/>
                            {exportFiles && exportFiles.filter(({ path }) => path.replace(/\/+|\\+/g, '/').replace(Instance.path.replace(/\/+|\\+/g, '/'), '').match(/\/+|\\+/g)?.length === 1)
                            .sort((a, b) => b.name.localeCompare(a.name))
                            .sort(({ isDir }, { isDir2 }) => isDir === isDir2 ? 0 : isDir ? -1 : 1)
                            .map(({ name, isDir, banned, selected, sensitive }, index) => <React.Fragment key={index}>
                                <Grid spacing="8px" padding="4px 8px" alignItems="center">
                                    <Toggle size="small" value={selected} disabled={banned} onChange={event => {
                                        exportFiles.find(f => f.name === name).selected = event.target.value;
                                        if(isDir)
                                            for (const file of exportFiles)
                                                if(!file.banned && file.path.replace(/\/+|\\+/g, '/').replace(Instance.path.replace(/\/+|\\+/g, '/'), '').startsWith(`/${name}/`))
                                                    file.selected = event.target.value;
                                        setExportFiles(exportFiles);
                                    }}/>
                                    {isDir ?
                                        <FolderFill color={banned ? "var(--colors-secondaryColor)" : "var(--colors-primaryColor)"}/> :
                                        <FileTextFill color={banned ? "var(--colors-secondaryColor)": "var(--colors-primaryColor)"}/>
                                    }
                                    <Typography color={banned ? "$secondaryColor" : "$primaryColor"} family="Nunito">
                                        {name}
                                        {sensitive && <Typography size=".7rem" color="$secondaryColor" weight={400} margin="0 0 0 8px" family="Nunito" lineheight={1}>
                                            May contain sensitive information
                                        </Typography>}
                                    </Typography>
                                </Grid>
                                {index < exportFiles.length - 1 && <Divider width="100%" css={{ minHeight: 1 }}/>}
                            </React.Fragment>)}
                        </Grid>
                    </React.Fragment>]
                ]}
                value={tabPage}
                onChange={event => setTabPage(event.target.value)}
                css={{
                    width: 'auto',
                    height: '-webkit-fill-available',
                    margin: '0 1rem 1rem'
                }}
            />
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