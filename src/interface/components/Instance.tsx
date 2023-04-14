import { Buffer } from 'buffer';
import { keyframes } from '@stitches/react';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import { Grid, Typography, ContextMenu } from 'voxeliface';
import React, { memo, useMemo, useEffect, useRef } from 'react';

import Avatar from './Avatar';

import { toast } from '../../util';
import { useInstance } from '../../voxura';
import { useAppDispatch } from '../../store/hooks';
import { INSTANCE_STATE_ICONS } from '../../util/constants';
import { getDefaultInstanceBanner } from '../../util';
import { setPage, setInstanceTab, setCurrentInstance } from '../../store/slices/interface';
const Animation = keyframes({
	'0%': {
		opacity: 0,
		transform: 'scale(.9) translateY(8px)'
	},
	'100%': {
		opacity: 1,
		transform: 'none'
	}
});

export interface InstanceProps {
	id: string
	selected?: boolean
}
export default memo(({ id, selected }: InstanceProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const instance = useInstance(id);
	const banner = useMemo(() => {
		if (!instance)
			return '';
		const { name, banner, bannerFormat } = instance;
		return banner ? `data:image/${bannerFormat};base64,${Buffer.from(banner).toString('base64')}` : getDefaultInstanceBanner(name);
	}, [instance?.name, instance?.banner]);
	useEffect(() => {
		if (selected)
			ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth'});
	}, [selected]);
	if (!instance)
		return null;

	const StateIcon = INSTANCE_STATE_ICONS[instance.state];
	const viewTab = (tab: number) => {
		view();
		dispatch(setInstanceTab(tab));
	};
	const favorite = () => instance.setCategory(t('mdpkm:instance_category.favorites'));
	const copyId = () => writeText(instance.id).then(() => toast('copied_id', [instance.name]));
	const view = () => {
		dispatch(setCurrentInstance(instance.id));
		dispatch(setPage('instances'));
	};
	
	return <ContextMenu.Root>
		<ContextMenu.Trigger asChild>
			<Grid ref={ref} width="100%" alignItems="start" css={{
				cursor: 'default',
				animation: `${Animation} 500ms cubic-bezier(0.4, 0, 0.2, 1)`,
				animationFillMode: 'forwards'
			}}>
				<Grid width="100%" height="100%" onClick={view} smoothing={1} alignItems="center" borderRadius={16} justifyContent="space-between" css={{
					cursor: selected ? 'unset' : 'pointer',
					overflow: 'hidden',
					transition: 'transform .5s',
					'&:before': {
						width: '100%',
						zIndex: -2,
						height: '100%',
						filter: selected ? 'brightness(1.2)' : undefined,
						content: '',
						opacity: selected ? 1 : 0.5,
						position: 'absolute',
						transition: 'background 1s',
						background: selected ? '$secondaryBackground2' : `url(${banner}) right`,
						backgroundSize: '75%'
					},
					'&:after': selected ? undefined : {
						width: '100%',
						zIndex: -1,
						height: '100%',
						content: '',
						position: 'absolute',
						transition: 'filter .5s',
						background: 'linear-gradient(45deg, $secondaryBackground2 40%, #00000000 200%)'
					},
					'&:hover:after': {
						filter: 'brightness(1.25)'
					},
					'&:active': {
						transform: 'scale(0.95)'
					}
				}}>
					<Grid padding={8} spacing={12} alignItems="center" css={{
						overflow: 'hidden',
						position: 'relative'
					}}>
						<Avatar src={instance.webIcon} size="md"/>
						<Grid spacing={4} vertical alignItems="start" css={{ overflow: 'hidden' }}>
							<Grid spacing={4} alignItems="center">
								{instance.isFavourite && <IconBiStarFill fontSize={14}/>}
								<Typography
									width="100%"
									noFlex
									noSelect
									lineheight={1}
									whitespace="nowrap"
									css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
								>
									{instance.name}
								</Typography>
							</Grid>
							<Typography
								size={12}
								color="$secondaryColor"
								family="$secondary"
								spacing={6}
								noSelect
								lineheight={1}
							>
								<StateIcon fontSize={10}/>
								{t(`instance.state.${instance.state}`)}
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Label>
				Instance Options ({instance.name})
			</ContextMenu.Label>
			<ContextMenu.Item onClick={() => instance.launch()} disabled={instance.isLaunching}>
				<IconBiPlayFill/>
				{t('common.action.launch')}
			</ContextMenu.Item>
			<ContextMenu.Item onClick={view}>
				<IconBiZoomIn/>
				{t('common.action.view')}
			</ContextMenu.Item>
			<ContextMenu.Separator/>
			<ContextMenu.Item onClick={favorite}>
				<IconBiStar/>
				Add to Favourites
			</ContextMenu.Item>
			<ContextMenu.Separator/>
			<ContextMenu.Item onClick={() => viewTab(0)}>
				<IconBiInfoCircle/>
				{t('instance_page.tab.home')}
			</ContextMenu.Item>
			<ContextMenu.Item onClick={() => viewTab(1)}>
				<IconBiBox2/>
				{t('instance_page.tab.content')}
			</ContextMenu.Item>
			<ContextMenu.Item onClick={() => viewTab(2)}>
				<IconBiBox/>
				{t('instance_page.tab.game')}
			</ContextMenu.Item>
			<ContextMenu.Item onClick={() => viewTab(3)}>
				<IconBiGear/>
				{t('instance_page.settings')}
			</ContextMenu.Item>
			<ContextMenu.Separator/>
			<ContextMenu.Item onClick={copyId}>
				<IconBiClipboardPlus/>
				{t('common.action.copy_id')}
			</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>;
});