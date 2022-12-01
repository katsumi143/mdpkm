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
import Content from './content';
import Spinner from '/voxeliface/components/Spinner';
import TabItem from '/voxeliface/components/Tabs/Item';
import Settings from './settings';
import Typography from '/voxeliface/components/Typography';
import InstanceIcon from '../InstanceIcon';
import BasicSpinner from '/voxeliface/components/BasicSpinner';
import InstanceExport from '../InstanceExport';
import ServerManagement from '../ServerManagement';

import Util from '../../../common/util';
import Patcher from '../../../plugins/patcher';
import { toast } from '../../../util';
import { INSTANCE_STATE_ICONS } from '../../../util/constants';
import { useInstance, useCurrentAccount } from '../../../voxura';

export default Patcher.register(function InstancePage({ id }) {
    const { t } = useTranslation();
    const account = useCurrentAccount();
    const uiStyle = useSelector(state => state.settings.uiStyle);
    const instance = useInstance(id);
    const StateIcon = INSTANCE_STATE_ICONS[instance?.state];

    const { name, path, config, modpack } = instance ?? {};

    const logErrors = instance?.launchLogs?.filter(({ type }) => type === 'ERROR');
    const [tabPage, setTabPage] = useState(0);
    const [consoleOpen, setConsoleOpen] = useState(false);
    const viewModpackSite = () => open(modpack.websiteUrl);
    const launchInstance = () => {
        instance.launch().then(() => {
            toast('Client has launched', instance.name);
        }).catch(err => {
            console.error(err);
            toast('Unexpected error', 'Failed to launch client.');
        });
    };
    const openFolder = () => open(path);
    useEffect(() => {
        setConsoleOpen(false);
    }, [id]);

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
                    <Settings instance={instance}/>
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