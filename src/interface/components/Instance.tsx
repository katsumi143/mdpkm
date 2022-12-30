import { keyframes } from '@stitches/react';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import React, { memo, useMemo } from 'react';
import { Link, Grid, Typography, ContextMenu } from 'voxeliface';

import ImageWrapper from './ImageWrapper';

import { toast } from '../../util';
import voxura, { useInstance } from '../../voxura';
import { INSTANCE_STATE_ICONS } from '../../util/constants';
import { setPage, setCurrentInstance } from '../../store/slices/interface';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
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
const viewAnimation = keyframes({
	'100%': {
		right: 0,
		opacity: 0,
		position: 'absolute',
		transform: 'translateX(100%)'
	}
});

export interface InstanceProps {
	id: string
	selected?: boolean
}
export default memo(({ id, selected }: InstanceProps) => {
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const instance = useInstance(id);
	const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
	if (!instance)
		return null;

	const loading = voxura.instances.loading;
	const StateIcon = INSTANCE_STATE_ICONS[instance.state];
	const favorite = () => instance.setCategory(t('mdpkm:instance_category.favorites'));
	const copyId = () => writeText(instance.id).then(() => toast(t('app.mdpkm.common:toast.copied'), t('app.mdpkm.common:toast.copied_instance_id.body')));
	const view = () => {
		dispatch(setCurrentInstance(instance.id));
		dispatch(setPage('instances'));
	};
	
	return <ContextMenu.Root>
		<ContextMenu.Trigger fullWidth>
			<Grid width="100%" height="fit-content" alignItems="start" css={{
				cursor: 'default',
				opacity: loading ? 0.25 : 0,
				animation: loading ? undefined : `${Animation} 500ms cubic-bezier(0.4, 0, 0.2, 1)`,
				animationFillMode: 'forwards'
			}}>
				<Grid width="100%" height="100%" alignItems="center" borderRadius={isCompact ? 8 : 16} justifyContent="space-between" css={{
					border: selected ? 'transparent solid 1px' : '$secondaryBorder solid 1px',
					overflow: 'hidden',
					background: selected ? '$gradientBackground2 padding-box, $gradientBorder2 border-box' : '$primaryBackground'
				}}>
					<Grid padding={isCompact ? 6 : 8} spacing={isCompact ? 10 : 12} alignItems="center" css={{
						overflow: 'hidden',
						position: 'relative'
					}}>
						<ImageWrapper src={instance.webIcon} size={isCompact ? 36 : 48} smoothing={1} background="$secondaryBackground2" borderRadius={8} css={{
							minWidth: isCompact ? 36 : 48,
							backgroundSize: 'cover'
						}}/>
						<Grid spacing={isCompact ? 2 : 4} vertical alignItems="start" css={{ overflow: 'hidden' }}>
							<Typography
								size={isCompact ? 14 : 16}
								width="100%"
								noFlex
								weight={isCompact ? 400 : 500}
								noSelect
								lineheight={1}
								whitespace="nowrap"
								css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
							>
								{instance.isFavourite && <IconBiStarFill fontSize={12} style={{ marginRight: 4 }}/>}
								{instance.name}
							</Typography>
							<Typography
								size={isCompact ? 11 : 12}
								color="$secondaryColor"
								weight={400}
								family="$secondary"
								spacing={6}
								noSelect
								lineheight={1}
							>
								<StateIcon fontSize={isCompact ? 8 : 10} />
								{t(`instance.state.${instance.state}`)}
							</Typography>
						</Grid>
					</Grid>
					<Link size={isCompact ? 11 : 12} height="100%" onClick={view} padding="0 16px" css={{
						animation: selected ? `${viewAnimation} .25s ease-in` : undefined,
						animationFillMode: 'forwards'
					}}>
						{t('common.action.view')}
						<IconBiArrowRight />
					</Link>
				</Grid>
			</Grid>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.MenuLabel>
				Instance Options ({instance.name})
			</ContextMenu.MenuLabel>
			<ContextMenu.MenuItem>
				<IconBiPlay/>
				{t('common.action.launch')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuItem onClick={view}>
				<IconBiZoomIn/>
				{t('common.action.view')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuSeparator/>
			<ContextMenu.MenuItem onClick={favorite}>
				<IconBiStar/>
				Add to Favourites
			</ContextMenu.MenuItem>
			<ContextMenu.MenuItem>
				<IconBiGear/>
				Instance Settings
			</ContextMenu.MenuItem>
			<ContextMenu.MenuSeparator />
			<ContextMenu.MenuItem onClick={copyId}>
				<IconBiClipboardPlus/>
				Copy ID
			</ContextMenu.MenuItem>
		</ContextMenu.Content>
	</ContextMenu.Root>;
});