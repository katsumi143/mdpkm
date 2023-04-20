import { open } from '@tauri-apps/api/shell';
import * as dialog from '@tauri-apps/api/dialog';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CSS, keyframes } from '@stitches/react';
import { copyFile, removeFile } from '@tauri-apps/api/fs';
import React, { useMemo, ReactNode, MouseEvent, useCallback } from 'react';
import { Grid, Link, Image, TabItem, GridProps, Typography, BasicSpinner, DropdownMenu } from 'voxeliface';

import Home from './home';
import Game from './game';
import Tabs from '../Tabs';
import Content from './content';
import Settings from './settings';
import ImageWrapper from '../ImageWrapper';

import { useInstance } from '../../../voxura';
import { useAppSelector } from '../../../store/hooks';
import { setInstanceTab } from '../../../store/slices/interface';
import { COMPONENT_EXTRAS } from '../../../mdpkm';
import { INSTANCE_STATE_ICONS } from '../../../util/constants';
import { IMAGE_EXISTS, getInstanceIcon, getInstanceBanner } from '../../../util';
export interface InstancePageProps {
	id: string
}
export default function InstancePage({ id }: InstancePageProps) {
	const tab = useAppSelector(state => state.interface.instanceTab);
	const { t } = useTranslation('interface');
	const dispatch = useDispatch();
	const instance = useInstance(id)!;
	const { path, state, processes, isLaunching, displayName } = instance;
	const launch = useCallback(() => instance.launch(), [instance]);
	const setTab = useCallback((tab: number) => dispatch(setInstanceTab(tab)), []);
	const StateIcon = useMemo(() => INSTANCE_STATE_ICONS[state], [state]);
	const openFolder = useCallback(() => open(path), [path]);
	const changeImage = useCallback((name: string, event: MouseEvent) => {
		event.stopPropagation();
		dialog.open({
			filters: [{
				name: 'Image',
				extensions: ['png', 'gif']
			}]
		}).then(path => {
			if (typeof path !== 'string')
				return;
			copyFile(path, `${instance.path}/mdpkm-${name}`).then(() => {
				IMAGE_EXISTS.set(`${instance.id}-${name}`, true);
				instance.emitEvent('changed');
			});
		});
	}, [instance]);
	const removeImage = useCallback((name: string, event: MouseEvent) => {
		event.stopPropagation();
		removeFile(`${path}/mdpkm-${name}`).then(() => {
			IMAGE_EXISTS.set(`${instance.id}-${name}`, false);
			instance.emitEvent('changed');
		});
	}, [instance]);

	const icon = getInstanceIcon(instance);
	const banner = getInstanceBanner(instance);
	return <Grid height="100%" vertical background="$primaryBackground" css={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
		<Image src={banner[0]} width="100%" height={144} css={{
			opacity: 0.5,
			position: 'absolute',
			transition: 'background .5s',
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			'-webkit-mask-image': '-webkit-linear-gradient(#000 -20%, transparent)'
		}}/>
		<Grid alignItems="end" justifyContent="space-between" css={{
			zIndex: 1,
			position: 'relative',
			minHeight: 144
		}}>
			<Grid padding={16} spacing={24}>
				<Grid cornerRadius={8} css={{
					boxShadow: '0 8px 16px 2px #00000040'
				}}>
					<ImageWrapper src={icon[0]} size={80} smoothing={1} canPreview background="$secondaryBackground2" cornerRadius={8} css={{
						alignItems: 'end',
						justifyContent: 'end',
						backgroundSize: 'cover',
						'&:hover': { '& > div': { opacity: 1 } }
					}}>
						<ImageOptions exists={icon[1]} onEdit={e => changeImage('icon', e)} onRemove={e => removeImage('icon', e)}/>
					</ImageWrapper>
				</Grid>
				<Grid spacing={4} vertical justifyContent="center">
					<Typography size={24} weight={700} family="$tertiary" noSelect lineheight={1} css={{ alignItems: 'start' }}>
						{displayName}
					</Typography>
					<Typography color="$secondaryColor" weight={600} family="$secondary" spacing={8} noSelect lineheight={1}>
						<StateIcon fontSize={14}/>
						{t(`instance.state.${state}`)}
					</Typography>
				</Grid>
				<Grid width="100%" height="100%" padding={8} justifyContent="end" css={{
					top: 0,
					left: 0,
					zIndex: -1,
					position: 'absolute',
					'&:hover': { '& > div': { opacity: 1 } }
				}}>
					<ImageOptions exists={banner[1]} onEdit={e => changeImage('banner', e)} onRemove={e => removeImage('banner', e)}/>
				</Grid>
			</Grid>
			<Grid>
				<Link size={14} onClick={openFolder} padding={16}>
					<IconBiFolder2Open/>
					{t('common.action.open_folder')}
				</Link>
				{processes.length ? <DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<Link size={14} padding="16px 24px 16px 16px">
							{t('instance.action.view_options')}
							<IconBiChevronDown/>
						</Link>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content>
							<DropdownMenu.Label>{t('common.label.actions')}</DropdownMenu.Label>
							<DropdownMenu.Item onClick={launch}>
								<IconBiPlayFill/>
								{t('common.action.launch')}
							</DropdownMenu.Item>
							<DropdownMenu.Separator/>
							
							<DropdownMenu.Label>{t('common.label.processes')}</DropdownMenu.Label>
							{processes.map((child, key) =>
								<DropdownMenu.Item key={key} onClick={() => instance.killProcess(child)}>
									<IconBiXLg/>
									{t('common.action.kill_process', [key + 1])}
								</DropdownMenu.Item>
							)}
							<DropdownMenu.Arrow/>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root> :
					<Link size={14} onClick={launch} padding="16px 24px 16px 16px" disabled={isLaunching || instance.isRunning}>
						{isLaunching ? <BasicSpinner size={16}/> : <IconBiPlayFill/>}
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
				<Home store={instance.store} setTab={setTab}/>
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
	return <Grid margin="0 1rem 1rem" spacing={16} padding="16px 24px" alignItems="center" background="$secondaryBackground2" cornerRadius={16} css={{
		position: 'relative',
		animation: animate ? `${InstanceInfoAnimation} .5s cubic-bezier(0.4, 0, 0.2, 1)` : null,
		...css
	}}>
		{children}
	</Grid>;
}

export interface ImageOptionsProps {
	exists: boolean
	onEdit: GridProps["onClick"]
	onRemove: GridProps["onClick"]
}
export function ImageOptions({ exists, onEdit, onRemove }: ImageOptionsProps) {
	return <Grid height="fit-content" css={{
		opacity: 0,
		transition: 'opacity .5s'
	}}>
		{(exists && onRemove) && <ImageOption icon={<IconBiXLg fontSize={10}/>} onClick={onRemove}/>}
		{onEdit && <ImageOption icon={<IconBiPencilFill fontSize={10}/>} onClick={onEdit}/>}
	</Grid>;
}

export interface ImageOptionProps {
	icon: ReactNode
	onClick: GridProps["onClick"]
}
export function ImageOption({ icon, onClick }: ImageOptionProps) {
	return <Grid margin={4} padding={4} onClick={onClick} background="#00000080" cornerRadius={9999} css={{
		cursor: 'pointer'
	}}>
		<Typography color="#fff">{icon}</Typography>
	</Grid>;
}