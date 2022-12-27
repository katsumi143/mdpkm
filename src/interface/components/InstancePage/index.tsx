import { open } from '@tauri-apps/api/shell';
import { Buffer } from 'buffer';
import * as dialog from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import { CSS, keyframes } from '@stitches/react';
import { copyFile, removeFile } from '@tauri-apps/api/fs';
import React, { useMemo, useState, ReactNode, MouseEvent } from 'react';

import Home from './home';
import Game from './game';
import Tabs from '../Tabs';
import Content from './content';
import Settings from './settings';
import ImageWrapper from '../ImageWrapper';
import { useDispatch } from 'react-redux';
import type { GridProps } from 'voxeliface';
import { Grid, Link, Image, TabItem, Typography, BasicSpinner, DropdownMenu } from 'voxeliface';

import Patcher from '../../../plugins/patcher';
import { LaunchError } from '../../../../voxura';
import { useAppSelector } from '../../../store/hooks';
import { setLaunchError } from '../../../store/slices/interface';
import { COMPONENT_EXTRAS } from '../../../mdpkm';
import { INSTANCE_STATE_ICONS } from '../../../util/constants';
import { useInstance, useCurrentAccount } from '../../../voxura';
import { toast, getDefaultInstanceBanner } from '../../../util';

export type InstancePageProps = {
	id: string
};
export default Patcher.register(function InstancePage({ id }: InstancePageProps) {
	const { t } = useTranslation('interface');
	const account = useCurrentAccount();
	const uiStyle = useAppSelector(state => state.settings.uiStyle);
	const dispatch = useDispatch();
	const instance = useInstance(id);
	const isCompact = uiStyle === 'compact';
	const StateIcon = INSTANCE_STATE_ICONS[instance?.state as any];
	const banner = useMemo(() => {
		const { banner } = instance ?? {};
		return banner ? 'data:image/png;base64,' + Buffer.from(banner).toString('base64') : getDefaultInstanceBanner(instance?.name);
	}, [instance?.banner]);

	const [tabPage, setTabPage] = useState(0);
	if (!instance)
		return;

	const launchInstance = () => instance.launch().then(() => {
		toast('Client has launched', instance.name);
	}).catch(err => {
		toast('Unexpected error', 'Failed to launch client.');
		if (err instanceof LaunchError)
			dispatch(setLaunchError([id, err.message, err.extraData]));
		throw err;
	});
	const openFolder = () => open(instance.path);
	const changeImage = (name: string, event: MouseEvent) => {
		event.stopPropagation();
		dialog.open({
			filters: [{
				name: 'Image',
				extensions: ['png']
			}]
		}).then(path => {
			if (typeof path !== 'string')
				return;
			copyFile(path, `${instance.path}/${name}.png`).then(() =>
				instance[name === 'icon' ? 'readIcon' : 'readBanner']().then(() => instance.emitEvent('changed'))
			);
		});
	};
	const removeImage = (name: string, event: MouseEvent) => {
		event.stopPropagation();
		removeFile(`${instance.path}/${name}.png`).then(() => {
			(instance as any)[name] = null;
			instance.emitEvent('changed');
		});
	};
	return <Grid height="100%" vertical background="$primaryBackground" css={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
		<Image src={banner} width="100%" height={isCompact ? 128 : 144} css={{
			opacity: 0.5,
			position: 'absolute',
			backgroundSize: 'cover',
			backgroundPosition: 'center'
		}}>
			<Grid width="100%" height="100%" background="linear-gradient(transparent -20%, $primaryBackground 90%)"/>
		</Image>
		<Grid alignItems="end" justifyContent="space-between" css={{
			zIndex: 1,
			position: 'relative',
			minHeight: isCompact ? 128 : 144
		}}>
			<Grid padding={16} spacing={24}>
				<Grid borderRadius={8} css={{
					boxShadow: '0 8px 16px 2px #00000040'
				}}>
					<ImageWrapper src={instance.webIcon} size={isCompact ? 64 : 80} smoothing={1} canPreview background="$secondaryBackground2" borderRadius={8} css={{
						alignItems: 'end',
						justifyContent: 'end',
						'&:hover': { '& > div': { opacity: 1 } }
					}}>
						<ImageOptions img={instance.icon} onEdit={e => changeImage('icon', e)} onRemove={e => removeImage('icon', e)}/>
					</ImageWrapper>
				</Grid>
				<Grid spacing={isCompact ? 4 : 4} vertical justifyContent="center">
					<Typography size={isCompact ? 20 : 22} family="$tertiary" noSelect lineheight={1} css={{ alignItems: 'start' }}>
						{instance.isFavourite && <IconBiStarFill fontSize={16}/>}
						{instance.name}
					</Typography>
					<Typography size={isCompact ? 14 : 16} color="$secondaryColor" weight={400} family="$secondary" spacing={6} noSelect lineheight={1}>
						<StateIcon fontSize={12}/>
						{t(`instance.state.${instance.state}`)}
					</Typography>
				</Grid>
				<Grid width="100%" height="100%" padding={8} justifyContent="end" css={{
					top: 0,
					left: 0,
					zIndex: -1,
					position: 'absolute',
					'&:hover': { '& > div': { opacity: 1 } }
				}}>
					<ImageOptions img={instance.banner} onEdit={e => changeImage('banner', e)} onRemove={e => removeImage('banner', e)}/>
				</Grid>
			</Grid>
			<Grid>
				<Link size={12} onClick={openFolder} padding={16}>
					<IconBiFolder2Open/>
					{t('common.action.open_folder')}
				</Link>
				{instance.processes.length ? <DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<Link size={12} padding="16px 24px 16px 16px">
							{t('instance.action.view_options')}
							<IconBiChevronDown/>
						</Link>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content>
							<DropdownMenu.Label>{t('common.label.actions')}</DropdownMenu.Label>
							<DropdownMenu.Item onClick={launchInstance}>
								<IconBiPlayFill/>
								{t('common.action.launch')}
							</DropdownMenu.Item>
							<DropdownMenu.Seperator/>
							
							<DropdownMenu.Label>{t('common.label.processes')}</DropdownMenu.Label>
							{instance.processes.map((child, key) =>
								<DropdownMenu.Item key={key} onClick={() => instance.killProcess(child)}>
									<IconBiXLg/>
									{t('common.action.kill_process', [key + 1])}
								</DropdownMenu.Item>
							)}
							<DropdownMenu.Arrow/>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root> :
					<Link size={12} onClick={launchInstance} padding="16px 24px 16px 16px" disabled={instance.isLaunching || instance.isRunning || !account}>
						{instance.isLaunching ? <BasicSpinner size={16}/> : <IconBiPlayFill/>}
						{t('common.action.launch')}
					</Link>
				}
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
			<TabItem name={t('instance_page.tab.home')} icon={<IconBiInfoCircle/>} value={0}>
				<Home setTab={setTabPage} instance={instance}/>
			</TabItem>
			<TabItem name={t('instance_page.tab.content')} icon={<IconBiBox2/>} value={1} disabled={!instance.store.components.map(c => COMPONENT_EXTRAS[c.id]).some(e => e?.contentTabs?.length || e?.enabledContentTabs?.length)}>
				<Content instance={instance}/>
			</TabItem>
			<TabItem name={t('instance_page.tab.game')} icon={<IconBiBox/>} value={2}>
				<Game instance={instance}/>
			</TabItem>
			<TabItem name={t('instance_page.settings')} icon={<IconBiGear/>} value={3}>
				<Settings instance={instance}/>
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
				<IconBiExclamationCircle/>
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

export type ImageOptionsProps = {
	img?: Uint8Array | void,
	onEdit: GridProps["onClick"],
	onRemove: GridProps["onClick"]
};
function ImageOptions({ img, onEdit, onRemove }: ImageOptionsProps) {
	return <Grid height="fit-content" css={{
		opacity: 0,
		transition: 'opacity .5s'
	}}>
		{(!!img && onRemove) && <ImageOption icon={<IconBiXLg fontSize={10}/>} onClick={onRemove}/>}
		{onEdit && <ImageOption icon={<IconBiPencilFill fontSize={10}/>} onClick={onEdit}/>}
	</Grid>;
};

export type ImageOptionProps = {
	icon: ReactNode,
	onClick: GridProps["onClick"]
};
function ImageOption({ icon, onClick }: ImageOptionProps) {
	return <Grid margin={4} padding={4} onClick={onClick} background="#00000080" borderRadius="50%" css={{
		cursor: 'pointer'
	}}>
		<Typography color="#fff">{icon}</Typography>
	</Grid>;
};