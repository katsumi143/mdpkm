import { open } from '@tauri-apps/api/shell';
import { Buffer } from 'buffer';
import { useTranslation } from 'react-i18next';
import { CSS, keyframes } from '@stitches/react';
import React, { useMemo, useState, ReactNode } from 'react';

import Home from './home';
import Game from './game';
import Tabs from '../Tabs';
import Content from './content';
import Settings from './settings';
import InstanceIcon from '../InstanceIcon';
import InstanceExport from '../InstanceExport';
import { Grid, Link, Image, TabItem, Typography, BasicSpinner } from '../../../../voxeliface/src';

import Patcher from '../../../plugins/patcher';
import { useAppSelector } from '../../../store/hooks';
import { INSTANCE_STATE_ICONS } from '../../../util/constants';
import { useInstance, useCurrentAccount } from '../../../voxura';
import { toast, getDefaultInstanceBanner } from '../../../util';

export type InstancePageProps = {
	id: string
};
export default Patcher.register(function InstancePage({ id }: InstancePageProps) {
	const { t } = useTranslation();
	const account = useCurrentAccount();
	const uiStyle = useAppSelector(state => state.settings.uiStyle);
	const instance = useInstance(id);
	const isCompact = uiStyle === 'compact';
	const StateIcon = INSTANCE_STATE_ICONS[instance?.state as any];
	const banner = useMemo(() => {
		const { banner } = instance ?? {};
		return banner ? 'data:image/png;base64,' + Buffer.from(banner).toString('base64') : getDefaultInstanceBanner(instance?.name);
	}, [id]);

	const [tabPage, setTabPage] = useState(0);
	const launchInstance = () => {
		instance?.launch().then(() => {
			toast('Client has launched', instance.name);
		}).catch(err => {
			console.error(err);
			toast('Unexpected error', 'Failed to launch client.');
		});
	};
	const openFolder = () => open(instance?.path!);
	if (!instance)
		return;
	return <Grid height="100%" vertical background="$primaryBackground" css={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
		<Image src={banner} width="100%" height={isCompact ? 128 : 144} css={{
			opacity: 0.5,
			position: 'absolute',
			backgroundSize: 'cover',
			backgroundPosition: 'center'
		}}>
			<Grid width="100%" height="100%" background="linear-gradient(transparent -20%, $primaryBackground 90%)"/>
		</Image>
		<Grid alignItems="end" justifyContent="space-between" css={{ zIndex: 1, minHeight: isCompact ? 128 : 144 }}>
			<Grid padding={16} spacing={24}>
				<InstanceIcon size={isCompact ? 64 : 80} instance={instance} hideLoader css={{
					boxShadow: '0 8px 16px 2px #00000040'
				}}/>
				<Grid spacing={isCompact ? 4 : 4} vertical justifyContent="center">
					<Typography size={isCompact ? 20 : 22} family="$tertiary" lineheight={1} css={{ alignItems: 'start' }}>
						{instance.isFavourite && <IconBiStarFill fontSize={16}/>}
						{instance.name}
					</Typography>
					<Typography size={isCompact ? 14 : 16} color="$secondaryColor" weight={400} family="$secondary" spacing={6} lineheight={1}>
						<StateIcon fontSize={12}/>
						{t(`app.mdpkm.instances:state.${instance.state}`)}
					</Typography>
				</Grid>
			</Grid>
			<Grid height="100%" alignItems="end">
				<Link size={12} onClick={openFolder} padding={16}>
					<IconBiFolder2Open/>
					{t('app.mdpkm.common:actions.open_folder')}
				</Link>
				<Link size={12} onClick={launchInstance} padding="16px 24px 16px 16px" disabled={instance.isLaunching || instance.isRunning || !account}>
					{instance.isLaunching ? <BasicSpinner size={16}/> : !instance.isRunning && <IconBiPlayFill/>}
					{t(instance.isRunning ? `app.mdpkm.instances:state.${instance.state}` : 'app.mdpkm.common:actions.launch')}
				</Link>
			</Grid>
		</Grid>
		<Tabs
			value={tabPage}
			onChange={setTabPage}
			css={{
				width: 'auto',
				height: '100%',
				margin: '8px 16px 16px 16px'
			}}
		>
			<TabItem name={t('app.mdpkm.instance_page.tabs.home')} icon={<IconBiHouse/>} value={0}>
				<Home setTab={setTabPage} instance={instance}/>
			</TabItem>
			<TabItem name={t('app.mdpkm.instance_page.tabs.content')} icon={<IconBiBox2/>} value={1}>
				<Content instance={instance}/>
			</TabItem>
			<TabItem name={t('app.mdpkm.instance_page.tabs.game')} icon={<IconBiList/>} value={2}>
				<Game instance={instance}/>
			</TabItem>
			<TabItem name={t('app.mdpkm.instance_page.tabs.settings')} icon={<IconBiGear/>} value={3}>
				<Settings instance={instance}/>
			</TabItem>
			<TabItem name={t('app.mdpkm.instance_page.tabs.export')} icon={<IconBiFileEarmarkZip/>} value={4}>
				<InstanceExport instanceId={id}/>
			</TabItem>
		</Tabs>
		{/*instance.launchLogs &&
			<Grid width="auto" height={consoleOpen ? '70%' : 'auto'} margin="0 8px 8px" vertical background="$secondaryBackground2" borderRadius={8} css={{
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
				{consoleOpen && <Grid width="100%" vertical css={{
					overflow: 'auto'
				}}>
					{instance.launchLogs.map(({ text, type, thread, timestamp }, key) => {
						const date = new Date(parseInt(timestamp));
						return <Grid key={key} padding="4px 8px" spacing={8}>
							<Grid spacing={2} vertical>
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
		*/}
		{!account && <InstanceInfo animate>
			<Typography>
				<IconBiExclamationCircle />
			</Typography>
			<Grid spacing={4} vertical>
				<Typography size=".9rem" lineheight={1}>
					No Minecraft Account selected
				</Typography>
				<Typography size=".8rem" color="$secondaryColor" weight={400} textalign="start" lineheight={1.2} css={{ display: 'block' }}>
					Add a new account or choose one in <b>Accounts</b>.
				</Typography>
			</Grid>
		</InstanceInfo>}
	</Grid>;
});

const InstanceInfoAnimation = keyframes({
	from: {
		opacity: 0,
	},
	to: {
		opacity: 1
	}
});

export type InstanceInfoProps = {
	css?: CSS,
	animate?: boolean,
	children: ReactNode
};
function InstanceInfo({ css, animate, children }: InstanceInfoProps) {
	return <Grid margin="0 1rem 1rem" spacing={16} padding="16px 24px" alignItems="center" background="$secondaryBackground2" borderRadius="1rem" css={{
		position: 'relative',
		animation: animate ? `${InstanceInfoAnimation} .5s cubic-bezier(0.4, 0, 0.2, 1)` : null,
		...css
	}}>
		{children}
	</Grid>;
};