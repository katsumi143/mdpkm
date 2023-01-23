import { open } from '@tauri-apps/api/shell';
import { Buffer } from 'buffer';
import * as dialog from '@tauri-apps/api/dialog';
import { useTranslation } from 'react-i18next';
import { CSS, keyframes } from '@stitches/react';
import { copyFile, removeFile } from '@tauri-apps/api/fs';
import React, { useMemo, useState, ReactNode, MouseEvent } from 'react';
import { Grid, Link, Image, TabItem, Typography, BasicSpinner, DropdownMenu } from 'voxeliface';

import Home from './home';
import Game from './game';
import Tabs from '../Tabs';
import Content from './content';
import Settings from './settings';
import ImageWrapper from '../ImageWrapper';
import { useDispatch } from 'react-redux';
import type { GridProps } from 'voxeliface';

import { InstanceState } from '../../../../voxura';
import { useAppSelector } from '../../../store/hooks';
import { COMPONENT_EXTRAS } from '../../../mdpkm';
import { INSTANCE_STATE_ICONS } from '../../../util/constants';
import { setInstanceTab, setLaunchError } from '../../../store/slices/interface';
import { toast, getDefaultInstanceBanner } from '../../../util';
import { useInstance, useMinecraftAccount } from '../../../voxura';

export interface InstancePageProps {
	id: string
}
export default function InstancePage({ id }: InstancePageProps) {
	const tab = useAppSelector(state => state.interface.instanceTab);
	const { t } = useTranslation('interface');
	const account = useMinecraftAccount();
	const dispatch = useDispatch();
	const instance = useInstance(id);
	const banner = useMemo(() => {
		if (!instance)
			return '';
		const { name, banner, bannerFormat } = instance;
		return banner ? `data:image/${bannerFormat};base64,${Buffer.from(banner).toString('base64')}` : getDefaultInstanceBanner(name);
	}, [instance?.name, instance?.banner]);

	if (!instance)
		return null;

	const setTab = (tab: number) => dispatch(setInstanceTab(tab));
	const StateIcon = INSTANCE_STATE_ICONS[instance.state];
	const launchInstance = () => instance.launch().then(() => {
		toast('instance_launched', [instance.name]);
	}).catch(err => {
		toast('launch_error', [instance.name]);
		dispatch(setLaunchError([id, err.message, err.extraData]));

		instance.setState(InstanceState.None);
		throw err;
	});
	const openFolder = () => open(instance.path);
	const changeImage = (name: string, event: MouseEvent) => {
		event.stopPropagation();
		dialog.open({
			filters: [{
				name: 'Image',
				extensions: ['png', 'gif']
			}]
		}).then(path => {
			if (typeof path !== 'string')
				return;
			copyFile(path, `${instance.path}/${name}.${path.split('.').reverse()[0]}`).then(() =>
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
		<Image src={banner} width="100%" height={144} css={{
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
			minHeight: 144
		}}>
			<Grid padding={16} spacing={24}>
				<Grid borderRadius={8} css={{
					boxShadow: '0 8px 16px 2px #00000040'
				}}>
					<ImageWrapper src={instance.webIcon} size={80} smoothing={1} canPreview background="$secondaryBackground2" borderRadius={8} css={{
						alignItems: 'end',
						justifyContent: 'end',
						backgroundSize: 'cover',
						'&:hover': { '& > div': { opacity: 1 } }
					}}>
						<ImageOptions img={instance.icon} onEdit={e => changeImage('icon', e)} onRemove={e => removeImage('icon', e)}/>
					</ImageWrapper>
				</Grid>
				<Grid spacing={4} vertical justifyContent="center">
					<Typography size={22} family="$tertiary" noSelect lineheight={1} css={{ alignItems: 'start' }}>
						{instance.isFavourite && <IconBiStarFill fontSize={16}/>}
						{instance.name}
					</Typography>
					<Typography color="$secondaryColor" weight={400} family="$secondary" spacing={6} noSelect lineheight={1}>
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
			value={tab}
			onChange={setTab}
			css={{
				width: 'auto',
				height: '100%',
				margin: '8px 16px 0'
			}}
		>
			<TabItem name={t('instance_page.tab.home')} icon={<IconBiInfoCircle/>} value={0}>
				<Home setTab={setTab} instance={instance}/>
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
	</Grid>;
}

const InstanceInfoAnimation = keyframes({
	from: {
		opacity: 0,
	},
	to: {
		opacity: 1
	}
});

export interface InstanceInfoProps {
	css?: CSS
	animate?: boolean
	children: ReactNode
}
export function InstanceInfo({ css, animate, children }: InstanceInfoProps) {
	return <Grid margin="0 1rem 1rem" spacing={16} padding="16px 24px" alignItems="center" background="$secondaryBackground2" borderRadius="1rem" css={{
		position: 'relative',
		animation: animate ? `${InstanceInfoAnimation} .5s cubic-bezier(0.4, 0, 0.2, 1)` : null,
		...css
	}}>
		{children}
	</Grid>;
}

export interface ImageOptionsProps {
	img?: Uint8Array | void
	onEdit: GridProps["onClick"]
	onRemove: GridProps["onClick"]
}
export function ImageOptions({ img, onEdit, onRemove }: ImageOptionsProps) {
	return <Grid height="fit-content" css={{
		opacity: 0,
		transition: 'opacity .5s'
	}}>
		{(!!img && onRemove) && <ImageOption icon={<IconBiXLg fontSize={10}/>} onClick={onRemove}/>}
		{onEdit && <ImageOption icon={<IconBiPencilFill fontSize={10}/>} onClick={onEdit}/>}
	</Grid>;
}

export interface ImageOptionProps {
	icon: ReactNode
	onClick: GridProps["onClick"]
}
export function ImageOption({ icon, onClick }: ImageOptionProps) {
	return <Grid margin={4} padding={4} onClick={onClick} background="#00000080" borderRadius="50%" css={{
		cursor: 'pointer'
	}}>
		<Typography color="#fff">{icon}</Typography>
	</Grid>;
}